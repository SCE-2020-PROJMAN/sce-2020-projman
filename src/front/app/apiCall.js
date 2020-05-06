import axios from 'axios';

function apiCall(method, route, data = {}, options = {}) {
    const axiosConfig = {
        ...options,
        method: method,
        headers: {
            ...(options.headers || {}),
            Authorization: sessionStorage.getItem('authToken'),
        },
    };
    if (method === 'get') {
        axiosConfig.params = data;
    } else {
        axiosConfig.data = data;
    }
    return axios(`../${route}`, axiosConfig);
}

export default apiCall;
