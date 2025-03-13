import { EventEmitter } from 'events';

export const customEventEmitter = new EventEmitter();

export const CustomEvents = {
    USER_LOGGED_IN: 'userLoggedIn',
    USER_LOGGED_OUT: 'userLoggedOut',
    SHOW_MESSAGE: 'showMessage',
    CAT_PRICE_CHANGED: 'catPriceChanged',
    CAT_BOUGHT: 'catBought'
};

export const emitUserLoggedInEvent = (username: string) => {
    customEventEmitter.emit(CustomEvents.USER_LOGGED_IN, username);
};

export const emitUserLoggedOutEvent = () => {
    customEventEmitter.emit(CustomEvents.USER_LOGGED_OUT);
};

export const emitShowMessage = (text: string, variant: string) => {
    customEventEmitter.emit(CustomEvents.SHOW_MESSAGE, text, variant);
};

export const emitCatPriceChanged = () => {
    customEventEmitter.emit(CustomEvents.CAT_PRICE_CHANGED);
};

export const emitCatBought = () => {
    customEventEmitter.emit(CustomEvents.CAT_BOUGHT);
};