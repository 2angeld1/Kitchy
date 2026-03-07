import fs from 'fs';
import csvParser from 'csv-parser';

export const parseCsvFile = <T>(filePath: string): Promise<T[]> => {
    return new Promise((resolve, reject) => {
        const results: T[] = [];
        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                resolve(results);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
};
