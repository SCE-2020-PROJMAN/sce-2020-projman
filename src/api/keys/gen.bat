@ECHO OFF
REM Create self-signed certificate
openssl req -config conf.conf -new -x509 -sha256 -newkey rsa:2048 -nodes -keyout pdf-private.pem -days 365 -out pdf-cert.pem
REM Create CSR
openssl req -config example-com.conf -new -sha256 -newkey rsa:2048 -nodes -keyout pdf-private.pem -days 365 -out req.pem
REM Print self-signed certificate
openssl x509 -in pdf-cert.pem -text -noout
PAUSE
