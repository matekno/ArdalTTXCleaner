import fs from 'fs';
import yargs from 'yargs';

// configurar los argumentos de CLI
const argv = yargs
    .option('file', {
        alias: 'f',
        description: 'Archivo a limpiar',
        type: 'string',
    })
    .help()
    .alias('help', 'h')
    .argv;


/**
 * 
 * @param {string} fileName 
 * Dado un archivo de texto con formato TTX generado con Crystal de ISIS, devuelve un string con formato CSV
 * @warning para que ande con otros TTX hay que cambiar el paso 1 solamente (supongo...)
 * @returns 
 */
async function cleanTTX(fileName) {
    return new Promise((resolve, reject) => {
        fs.readFile(fileName, 'utf8', (err, data) => {
            if (err) {
                reject(err);
                return;
            }

            // 1. eliminar linea 24-28, 18-21. 13-16, 1-7
            // me imagino que para algun refactor podemos pasar como parametro una funcion que haga este paso de eliminacion, pq es distinto para cada reporte.
            const lines = data.split('\n');
            lines.splice(0, 7);
            lines.splice(-5);
            const toDelete = [5, 6, 7, 8, 10, 11, 12, 13];
            lines.forEach((line, index) => {
                if (toDelete.includes(index)) {
                    lines[index] = '';
                }
            });

            // 2. reemplazar , por null
            const lines2 = lines.map((line) => {
                return line.replace(/,/g, '');
            });

            // 3. reemplazar \t por ,
            const lines3 = lines2.map((line) => {
                return line.replace(/\t/g, ',');
            });

            // 4. agregar ids de categoria a las lineas correspondientes
            const cat1 = [0, 1, 2, 3, 4];
            const cat2 = [9];
            const cat3 = [14, 15];

            lines3.forEach((line, index) => {
                if (cat1.includes(index)) {
                    lines3[index] = '1,' + line;
                } else if (cat2.includes(index)) {
                    lines3[index] = '2,' + line;
                } else if (cat3.includes(index)) {
                    lines3[index] = '3,' + line;
                }
            });

            // 5. eliminar todas las lineas vacias
            const lines4 = lines3.filter((line) => {
                return line !== '';
            });

            // 6. borrar todos los \r
            const lines5 = lines4.map((line) => {
                return line.replace(/\r/g, '');
            });

            // 7. agregar titulares
            const stringTitulos = "CATEGORIA, ID, ITEM, CANTIDAD, MAXIMO, PROMEDIO, MINIMO, TOTAL, PORCENTAJE_PARTICIPACION";
            lines5.unshift(stringTitulos);
            const result = lines5.join('\n');

            resolve(result);
        });
    });
}

// que el programa devuelva como stdout el lines5
cleanTTX(argv.file).then((result) => {
    console.log(result);
}
).catch((err) => {
    console.log(err);
}
);

// guardar el output de lines 5 como un archivo csv
cleanTTX(argv.file).then((result) => {
    fs.writeFile('cleaned.csv', result, (err) => {
        if (err) {
            console.log(err);
        }
    });
}
).catch((err) => {
    console.log(err);
}
);