/**
 * Recebe qualquer string e retorna no formato "<parteInteira>,<duas casas decimais>".
 * Exemplos:
 *   formatCurrency("123") => "1,23"
 *   formatCurrency("5")   => "0,05"
 *   formatCurrency("99")  => "0,99"
 */
export function formatCurrency(value: string): string {
    // Remove tudo que não for dígito
    const apenasDigitos = value.replace(/\D/g, "");
  
    // Garante pelo menos 3 caracteres (parte inteira + 2 decimais)
    const padded = apenasDigitos.padStart(3, "0");
  
    // Separa parte inteira (tudo menos os dois últimos) e decimais (últimos dois)
    const inteiro = padded.slice(0, padded.length - 2);
    const decimal = padded.slice(-2);
  
    // Remove zeros à esquerda da parte inteira
    const inteiroSemZeroEsq = String(parseInt(inteiro, 10));
  
    return `${inteiroSemZeroEsq},${decimal}`;
  }
  