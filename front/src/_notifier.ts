import { NotifyUiType, NotifyLogType } from '@rws-framework/client';
//ts-expect-error no-types
// import alertify from 'alertifyjs';

export default function (message: string, logType: NotifyLogType = 'info', uiType: NotifyUiType = 'notification', onConfirm: (params: any) => void = (params: any) => {}) {
    switch(uiType){
    case 'notification':
        let notifType = 'success';

        if(logType === 'error'){
            notifType = 'error';
        }

        if(logType === 'warning'){
            notifType = 'warning';
        }

        // alertify.notify(message, notifType, 5, onConfirm);
        return;
    case 'alert':
        // alertify.alert('AI Notification', message, onConfirm);
        return;    
    case 'silent':
        if(logType == 'warning'){
            console.warn(message);
        }else if(logType == 'error'){
            console.error(message);
        }else{
            console.log(message);
        }            
        return;    
    }
}