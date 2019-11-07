const Controller = require('egg').Controller;
const yaml = require('js-yaml');

class ArticleController extends Controller {
    async index() {
        const { ctx, service } = this;
        const url = ctx.host;
        let github = await service.github.getFromBase(url);
        if (!github) {
            ctx.redirect('/auth/url')
        }
        else {
            if (ctx.query['reload']) {
                github = await service.github.updateGithub(github._id, github.base_url, github.github_url);
            }
            if (github.index_type == "html") {
                ctx.body = github.index_page;
            }
            else if (github.index_type == "md") {
                let html = ctx.helper.md_render(github.index_page);
                await ctx.render('md.hbs', { html: html })
            }
            else {
                throw { status: 404 };
            }
        }
    }

    async doc() {
        const { ctx, service } = this;
        const url = ctx.host;
        let github = await service.github.getFromBase(url);
        if (!github) {
            ctx.redirect('/auth/url');
        }
        else {
            if (!github.doc_type) {
                throw { status: 404 }
            }
            else {
                if (github.doc_type == "html") {
                    ctx.body = github.doc_index;
                    return;
                }
                else if (github.doc_type == "md") {
                    let main = ctx.helper.md_render(github.doc_index);
                    let side = ctx.helper.md_render(github.doc_side);
                    await ctx.render('doc.hbs', { main: main, side: side });
                }
                else {
                    throw { status: 404 };
                }
            }


        }
    }

    async docs() {
        const { ctx, service } = this;
        const host = ctx.host;
        const url = ctx.url.split('?')[0]
        let github = await service.github.getFromBase(host);
        if (!github) {
            ctx.redirect('/auth/url');
        }
        else {

            if (github.github_url) {

                let ans = await service.doc.findDoc(github.github_url, url)
                if (ctx.query['reload']) {
                    ans = await service.doc.updateDocAndTime(ans._id, github.github_url, url);
                }
                if (ans.type == 'html') {
                    await ctx.render('doc.hbs', { main: ans.data, side: github.doc_side })
                }
                else if (ans.type == 'md') {
                    let html = ctx.helper.md_render(ans.data)
                    await ctx.render('doc.hbs', { main: html, side: github.doc_side })
                }
                else {
                    throw { status: 404 }
                }
            }
            else {
                throw { status: 404 }
            }

        }
    }
    async all() {
        const { ctx, service } = this;
        const host = ctx.host;
        const url = ctx.url.split('?')[0]
        let github = await service.github.getFromBase(host);
        if (!github) {
            ctx.redirect('/auth/url');
        }
        else {

            if (github.github_url) {

                let ans = await service.doc.findDoc(github.github_url, url)
                if (ctx.query['reload']) {
                    ans = await service.doc.updateDocAndTime(ans._id, github.github_url, url);
                }
                if (ans.type == 'html') {
                    ctx.body = html;
                }
                else if (ans.type == 'md') {
                    let html = ctx.helper.md_render(ans.data)
                    await ctx.render('md.hbs', { html: html })
                }
                else  if (ans.type == 'code') {
                    await ctx.render('code.hbs', { code: ans.data })                    
                }
            }
            else {
                throw { status: 404 }
            }

        }
    }

    async url() {
        const { ctx, service } = this;
        const url = ctx.host;
        let github = await service.github.getFromBase(url);
        if (github) {
            ctx.redirect('/')
        }
        else {
            await ctx.render('url.hbs')
        }
    }

    async url_p() {
        const { ctx, service } = this;
        const url = ctx.host;
        const payload = ctx.request.body || {};
        let github = await service.github.getFromBase(url);
        if (github) {
            ctx.redirect('/')
        }
        else {
            await service.github.setBaseAndGithub(url, payload.url);
            ctx.redirect('/')
        }
    }
}

module.exports = ArticleController;
