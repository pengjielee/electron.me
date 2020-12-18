import axios from 'axios';

export default {
    getConfig() {
        return new Promise(function (resolve, reject) {
            window.localForage.getItem('config', function (err, value) {
                if (err) {
                    reject(err);
                } else {
                    resolve(value);
                }
            });
        });
    },
    getList(page, size, direction, labels, config) {
        return axios.get(
            `https://api.github.com/repos/${config.repo}/issues?page=${page}&per_page=${size}&direction=${direction}&labels=${labels}`,
            {
                headers: {
                    Authorization: `token ${config.token}`,
                },
            },
        );
    },
    getDetail(number, config) {
        return axios.get(`https://api.github.com/repos/${config.repo}/issues/${number}`, {
            headers: {
                Authorization: `token ${config.token}`,
            },
        });
    },
    addNote(data, config) {
        return axios.post(`https://api.github.com/repos/${config.repo}/issues`, data, {
            headers: {
                Authorization: `token ${config.token}`,
            },
        });
    },
    editNote(number, data, config) {
        return axios.patch(`https://api.github.com/repos/${config.repo}/issues/${number}`, data, {
            headers: {
                Authorization: `token ${config.token}`,
            },
        });
    },
    getTags(config) {
        return axios.get(`https://api.github.com/repos/${config.repo}/labels`, {
            headers: {
                Authorization: `token ${config.token}`,
            },
        });
    },
    getImages(config) {
        return axios.get(`https://api.github.com/repos/${config.repo}/contents/images`, {
            headers: {
                Authorization: `token ${config.token}`,
            },
        });
    },
    upload(name, data, config) {
        return axios.put(`https://api.github.com/repos/${config.repo}/contents/images/${name}`, data, {
            headers: {
                Authorization: `token ${config.token}`,
            },
        });
    },
};
