export class FileProcessingError extends Error {
    constructor(message: string, public fileType: string){
        super(message);
        this.name = 'FileProcessingError'
    };
};


export class NLPServiceError extends Error {
    constructor(message: string, public statusCode?: number){
        super(message);
        this.name = 'NLPServiceError'
    };
};



