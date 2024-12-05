export default {
    item:{
        click: 'chat.item:click'
    },
    context: {
        change: 'chat.context:change',
        convo_id_set: 'chat.context:id_set'
    },
    message: {
        send: 'chat.message:send',
        receive: 'chat.message:receive'
    },
    model: {
        set: 'chat.model:set'
    },
    menu: {
        toggle: 'app.menu:toggle',
        route_choose: 'app.menu:route_choose,'
    },
    trainer:{
        chapter: {
            check: 'trainer.chapter:check',
        }
    },
    global: {
        chat: {
            toggled: 'global.chat:toggled',            
        }
    }
};