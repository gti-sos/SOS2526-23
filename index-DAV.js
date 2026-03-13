
//Array con los datos de ejemplo de la tabla
const data = [
]

let regionBuscada = "Europe"; //Buscamos por región
let campoNumerico = "impression"; // Buscamos el campo de impresiones de anuncios

console.log(`Cálculo para la región: ${regionBuscada}`);

//Usamos filter para quedarnos solo con las filas de la región geográfica buscada
let datosFiltrados = data.filter(dato => dato.region === regionBuscada);

if (datosFiltrados.length > 0) {

    //Usamos map para extraer únicamente los valores del campo numérico que nos interesa
    let valoresNumericos = datosFiltrados.map(dato => dato[campoNumerico]);

    // Usamos reduce para sumar los valores
    let sumaTotal = valoresNumericos.reduce((acumulador, valorActual) => acumulador + valorActual, 0);

    //Calculamos la media
    let media = sumaTotal / valoresNumericos.length;

    //Mostramos el resultado por pantalla
    console.log(`La media de '${campoNumerico}' para la región de '${regionBuscada}' es: ${media}`);
} else {
    console.log(`No se encontraron datos para la región '${regionBuscada}'`);
}