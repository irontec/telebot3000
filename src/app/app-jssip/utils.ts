import {
    Message as JSSipMessage,
    session as JSSipSession,
    IncomingRequest as JSSipIncomingRequest,
    OutGoingRequest as JSSipOutGoingRequest
} from 'jssip';

export type UAEvent = 'connecting' |
    'connected' |
    'disconnected' |
    'registered' |
    'unregistered' |
    'registrationFailed' |
    'registrationExpiring' |
    'newRTCSession' |
    'newMessage';

export interface UAStatus {
    connected: boolean;
    status: UAEvent;
}

export type originator = 'remote' | 'local';
export type CallType = 'ringing' | 'active' | 'done' | 'missed';
export type CallIntalkSubtype = '' | 'talking' | 'hold';
export type CallDirection = 'IN' | 'OUT';


export interface UAconnectingData {
    socket: any;
    attemps: number;
}

export interface UAconnectedData {
    socket: any;
}

export interface UAdisconnectedData {
    socket: any;
    error: boolean;
    code?: number;
    reason?: string;
}

export interface UAregisteredData {
    response: any; // IncommingMessage should be exported  :(
}

export interface UAunregisteredData {
    response: any; // IncommingMessage should be exported  :(
    cause?: string;
}
export interface UAregistrationFailedData {
    response: any; // IncommingMessage should be exported  :(
    cause?: string;
}

export interface UAregistrationExpiringData {
    msg?: string; // Probable no payload?
}


export interface UAnewRTCSessionData {
    originator: originator;
    session: JSSipSession;
    request: any; // JsSIP.IncomingRequest // OutGoingRequest
}

export interface UAnewMessageData {
    originator: originator;
    message: JSSipMessage; // JSSIP.Message
    request: any; // JsSIP.IncomingRequest // OutGoingRequest
}

export type UAMessageData = UAconnectingData | UAconnectedData | UAdisconnectedData | UAregisteredData | UAunregisteredData |
UAregistrationFailedData | UAregistrationExpiringData | UAnewRTCSessionData | UAnewMessageData;

export interface UAMessage {
    event: UAEvent;
    data: UAMessageData;
}


export interface DTMFSignal {
    originator: originator;
    code: string;

}

