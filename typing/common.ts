import {MonitorBaseInfo} from "monitor/base";

export abstract class CommonPropertyData extends MonitorBaseInfo {

    public createTime: number;
    public monitorId: string;
    public monitorPage: string;
    public simpleUrl: string;
    public completeUrl: string;
    public customerKey: any;
    public versionCode: any;
    public projectVersion: string;

    protected constructor() {

        super();


    }
}
