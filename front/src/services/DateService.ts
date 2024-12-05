import { RWSService } from '@rws-framework/client';
import moment, { Moment, unitOfTime } from 'moment';
import 'moment/locale/en-gb';

moment.locale('en-gb');

class DateOperator {
    private _date: Date;
    private _moment: Moment;

    constructor(date: DateInputType){
        if(moment.isMoment(date)){
            this._date = date.toDate();
        }else if(typeof date ==='string'){
            this._date = new Date(date);
        }else{
            this._date = date;
        }
        
        this._moment = moment(this._date);
    }

    format(format: string = 'd.m.Y H:mm:ss'){
        return this._moment.format(format);
    }
    
}

type DateInputType =  Date | Moment | string;

class DateService extends RWSService {
    use(date: DateInputType){
        return new DateOperator(date);
    }

    diff(newerDate: DateInputType, olderDate: DateInputType, outputUnit: unitOfTime.Diff = 'days'): number {
        const momentNewer: Moment = DateService.makeMoment(newerDate);
        const momentOlder: Moment = DateService.makeMoment(olderDate);

        return momentNewer.diff(momentOlder, outputUnit);
    }

    static makeMoment(input: DateInputType): Moment
    {
        if (moment.isMoment(input)){
            return input as Moment;
        }

        return moment(input);
    }
}

export default DateService.getSingleton();