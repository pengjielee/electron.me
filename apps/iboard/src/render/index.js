// const $ = require('jquery');
const ipcRenderer = require('electron').ipcRenderer;
const { clipboard } = require('electron');
const fs = require('fs');
const path = require('path');

const AppDAO = require(path.join(__dirname, '../db/dao.js'));
const NoteRepository = require(path.join(__dirname, '../db/note_repository.js'));
const dao = new AppDAO(path.join(__dirname, '../my.db'));
const noteRepo = new NoteRepository(dao);
const utils = require(path.join(__dirname, '../utils/index.js'));

const PAGEBAR = {
    page: 1, //当前页
    size: 20, //每页显示多少条
    total: 0, //总页数
};

let TEMP_NOTES = null;

const toHtml = notes => {
    return notes.map(item => {
        return `<li class='note-item'>
					<div class='content js-content'>${item.content}</div>
					<div class='footer'>
							<span class='date'>${item.createDate} ${item.createTime}</span>
							<div class="actions">
								<span class='delete js-delete' data-id='${item.id}'>删除</span>
								<span class='copy js-copy'>复制</span>
							</div>
					</div>
				</li>`;
    });
};

const checkNotes = notes => {
    const $result = $('#js-search-result');
    if (notes.length <= 0) {
        $result.html('什么都没有');
    } else {
        $result.html('');
    }
};

const notifyMe = () => {
    // Let's check if the browser supports notifications
    if (!('Notification' in window)) {
        alert('This browser does not support desktop notification');
    }

    // Let's check whether notification permissions have already been granted
    else if (Notification.permission === 'granted') {
        // If it's okay let's create a notification
        var notification = new Notification('您有新的内容保存到粘贴板');
    }

    // Otherwise, we need to ask the user for permission
    else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(function (permission) {
            // If the user accepts, let's create a notification
            if (permission === 'granted') {
                var notification = new Notification('您有新的内容保存到粘贴板');
            }
        });
    }

    // At last, if the user has denied notifications, and you
    // want to be respectful there is no need to bother them any more.
};

const setTempNotes = notes => {
    TEMP_NOTES = notes;
};

const loadNotes = async () => {
    const notes = await noteRepo.getByPage(PAGEBAR.page, PAGEBAR.size);
    const html = toHtml(notes);
    $('#js-notes').html(html);
    setTempNotes(notes);
    createPageBar();
    checkNotes(notes);
};

const createPageBar = async () => {
    const result = await noteRepo.getTotal();
    const num = result[0].num;
    PAGEBAR.total = Math.ceil(num / PAGEBAR.size);

    var html = `
		<button class="pure-button pure-button-primary btn-page ${
            PAGEBAR.page === 1 ? 'pure-button-disabled' : ''
        }" data-tag="first">首页</button>
    <button class="pure-button pure-button-primary btn-page ${
        PAGEBAR.page === 1 ? 'pure-button-disabled' : ''
    }" data-tag="prev">上一页</button>
    <button class="pure-button pure-button-primary btn-page ${
        PAGEBAR.page === PAGEBAR.total ? 'pure-button-disabled' : ''
    }" data-tag="next">下一页</button>
    <button class="pure-button pure-button-primary btn-page ${
        PAGEBAR.page === PAGEBAR.total ? 'pure-button-disabled' : ''
    }" data-tag="last">尾页</button>
    <span>${PAGEBAR.page}/${PAGEBAR.total}</span>
	`;

    $('#js-pagebar').html(html);

    if (PAGEBAR.total <= 1) {
        $('#js-pagebar').hide();
    } else {
        $('#js-pagebar').show();
    }
};

const reset = () => {
    $('#js-search-date').val('');
    $('#js-export-select').val('');
    $('#js-search-keyword').val('');
    PAGEBAR.page = 1;
    loadNotes();
};

window.onload = function () {
    //加载第1页
    loadNotes(PAGEBAR.page);

    ipcRenderer.on('refresh-notes', (event, notes) => {
        PAGEBAR.page = 1;
        loadNotes();
    });

    ipcRenderer.on('init-db', async event => {
        const result = await noteRepo.reset();
        console.log(result);
        reset();
    });

    ipcRenderer.on('new-content', async event => {
        notifyMe();
    });

    ipcRenderer.on('saved-file', (event, result) => {
        if (result.filePath && TEMP_NOTES) {
            const type = $('#js-export-select').val();
            let content = utils.getContent(type, TEMP_NOTES);
            fs.writeFileSync(result.filePath, content);
        }
    });

    //复制
    $('#js-notes').on('click', '.js-copy', function () {
        const self = $(this);
        let content = self.closest('.note-item').find('.js-content').html() || '';
        content = utils.decode(content);
        clipboard.writeText(content);
        self.html('复制成功').addClass('success');
        setTimeout(function () {
            self.html('复制').removeClass('success');
        }, 2000);
    });

    $('#js-notes').on('click', '.js-delete', function () {
        var id = $(this).attr('data-id');
        if (window.confirm('确认删除')) {
            noteRepo.delete(id).then(res => {
                if (res.id >= 0) {
                    loadNotes();
                }
            });
        }
    });

    //分页点击事件
    $('#js-pagebar').on('click', '.btn-page', function () {
        const tag = $(this).attr('data-tag');
        switch (tag) {
            case 'first':
                PAGEBAR.page = 1;
                break;
            case 'prev':
                PAGEBAR.page = PAGEBAR.page > 1 ? PAGEBAR.page - 1 : PAGEBAR.page;
                break;
            case 'next':
                PAGEBAR.page = PAGEBAR.page < PAGEBAR.total ? PAGEBAR.page + 1 : PAGEBAR.page;
                break;
            case 'last':
                PAGEBAR.page = PAGEBAR.total;
                break;
        }
        loadNotes();
    });

    //初始化日期
    $('#js-search-date').datepicker({
        language: 'zh',
    });

    //按日期搜索
    $('#js-search-btn').on('click', function () {
        const date = $('#js-search-date').val();
        const keyword = $('#js-search-keyword').val();
        noteRepo.search(keyword, date).then(notes => {
            console.log(notes);
            $('#js-notes').html(toHtml(notes));
            setTempNotes(notes);
            $('#js-pagebar').hide();
            checkNotes(notes);
        });
    });

    //清除
    $('#js-search-reset').on('click', function () {
        reset();
    });

    //导出
    $('#js-export-btn').on('click', function () {
        let filename = '';
        const date = $('#js-search-date').val();
        const type = $('#js-export-select').val();
        if (!type) {
            return;
        }
        if (date) {
            filename = date;
        } else {
            filename = `page${PAGEBAR.page}`;
        }

        ipcRenderer.send('save-dialog', { filename: filename, type: type });
    });

    $('#js-export-select').change(function () {
        const value = $(this).val();
        if (value) {
            $(this).addClass('active');
        } else {
            $(this).removeClass('active');
        }
    });

    $('#js-help').on('click', function () {
        ipcRenderer.send('open-help');
    });
};
