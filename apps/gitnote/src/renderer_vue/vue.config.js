module.exports = {
    publicPath: process.env.NODE_ENV === 'production' ? '' : '/',
    outputDir: process.env.NODE_ENV === 'production' ? '../renderer' : 'dist',
    filenameHashing: false,
    css: {
        extract: false,
    },
};
