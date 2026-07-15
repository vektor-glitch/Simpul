import 'midtrans-client';

declare module 'midtrans-client' {
    interface TransactionAction {
        notification(body: any): Promise<any>;
        status(transactionId: string): Promise<any>;
        statusb2b(transactionId: string): Promise<any>;
        approve(transactionId: string): Promise<any>;
        deny(transactionId: string): Promise<any>;
        cancel(transactionId: string): Promise<any>;
        expire(transactionId: string): Promise<any>;
        refund(transactionId: string, parameter?: any): Promise<any>;
        refundDirect(transactionId: string, parameter?: any): Promise<any>;
    }

    // Extend existing CoreApi class
    export interface CoreApi {
        transaction: TransactionAction;
    }

    // Extend existing Snap class
    export interface Snap {
        transaction: TransactionAction;
        createTransactionToken(parameter: any): Promise<string>;
        createTransactionRedirectUrl(parameter: any): Promise<string>;
    }
}
