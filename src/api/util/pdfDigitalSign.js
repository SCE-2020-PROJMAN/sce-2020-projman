// https://github.com/LacunaSoftware/RestPkiSamples/tree/master/NodeJS
import fs from 'fs';
import path from 'path';
import util from 'util';
import crypto from 'crypto';
import {
    PadesSignatureStarter,
    PadesSignatureFinisher,
    PadesMeasurementUnits,
    StandardSignaturePolicies,
    RestPkiClient,
    PadesVisualPositioningPresets,
} from 'restpki-client';

async function sign(pdfBuffer) {
    const [
        certificate,
        privateKey,
        stampImage,
    ] = await Promise.all([
        util.promisify(fs.readFile)(path.join(__dirname, 'keys', 'pdf-cert.pem')),
        util.promisify(fs.readFile)(path.join(__dirname, 'keys', 'pdf-private.pem'), 'binary'),
        util.promisify(fs.readFile)(path.join(__dirname, 'keys', 'stamp.png')),
    ]);

    const restPkiClient = new RestPkiClient('https://pki.rest/', process.env.REST_PKI_ACCESS_TOKEN);

    const visualRepresentation = {
        text: {
            // For a full list of the supported tags, see: https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PadesTags.md
            text: 'Signed by {{name}} ({{national_id}})',
            fontSize: 13.0,
            includeSigningTime: true,
            horizontalAlign: 'Left',
            container: {
                left: 0.2,
                top: 0.2,
                right: 0.2,
                bottom: 0.2,
            },
        },
        image: {
            resource: {
                content: Buffer.from(stampImage).toString('base64'),
                mimeType: 'image/png',
            },
            horizontalAlign: 'Right',
            verticalAlign: 'Center',
        },
        position: await (async () => {
            const visualPositioning = await PadesVisualPositioningPresets.getFootnote(restPkiClient);
            visualPositioning.auto.container.height = 4.94;
            visualPositioning.auto.signatureRectangleSize.width = 8.0;
            visualPositioning.auto.signatureRectangleSize.height = 4.94;
            return visualPositioning;
        })(),
    };
    
    const signatureStarter = new PadesSignatureStarter(restPkiClient);
    signatureStarter.pdfToSignContent = pdfBuffer;
    signatureStarter.signaturePolicy = StandardSignaturePolicies.PADES_BASIC;
    signatureStarter.securityContext = process.env.REST_PKI_SECURITY_CONTEXT_ID;
    signatureStarter.signerCertificate = certificate;
    signatureStarter.measurementUnits = PadesMeasurementUnits.CENTIMETERS;
    signatureStarter.visualRepresentation = visualRepresentation;
    const signatureParams = await signatureStarter.start();

    const sign = crypto.createSign(signatureParams.cryptoSignatureAlgorithm);
    sign.write(Buffer.from(signatureParams.toSignData, 'base64'));
    sign.end();
    const signature = sign.sign({ key: privateKey, passphrase: process.env.REST_PKI_PKEY_PASSPHRASE }, 'base64');
    
    const signatureFinisher = new PadesSignatureFinisher(restPkiClient);
    signatureFinisher.token = signatureParams.token;
    signatureFinisher.signature = signature;
    
    const result = await signatureFinisher.finish();
    return result.content;
}

export default {
    sign,
};
