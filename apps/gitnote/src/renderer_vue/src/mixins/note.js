const MarkdownIt = require('markdown-it');
const md = new MarkdownIt();

export const noteMixin = {
    methods: {
        handleMarkdown() {
            this.isPreview = false;
        },
        handlePreview() {
            const content = this.note.body;
            if (!content) {
                return;
            }
            this.isPreview = true;
            this.html = md.render(content);
        },
    },
    data() {
        return {
            isPreview: false,
            html: '',
        };
    },
};
