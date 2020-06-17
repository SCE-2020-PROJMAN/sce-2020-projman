import axios from 'axios';

function apiCall(method, route, data = {}, options = {}) {
    const axiosConfig = {
        ...options,
        method: method,
        headers: {
            ...(options.headers || {}),
            Authorization: sessionStorage.getItem('authToken'),
        },
        [method === 'get' ? 'params' : 'data']: data,
    };
    return axios(`../${route}`, axiosConfig)
        .catch(err => {
            if (err && err.response && err.response.status === 403) {
                if ([
                    'auth/validation',
                    'auth/existence',
                ].includes(err.response.data)) {
                    sessionStorage.removeItem('authToken');
                }
            }
            throw err;
        });
}

export default apiCall;
