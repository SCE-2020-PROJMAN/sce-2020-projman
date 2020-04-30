function controllerResponse(isError, status, body, data = {}) {
    return {
        error: isError,
        status: status ? status : (isError ? 500 : 200),
        body: body,
        ...data,
    };
}

export default controllerResponse;
