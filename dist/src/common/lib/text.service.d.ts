export declare class TextService {
    static encrypt(text: string): Promise<string>;
    static compare(text: string, hash: string): Promise<boolean>;
    static generateUuid(): string;
    static decodeBase64(encoded: string): string;
}
