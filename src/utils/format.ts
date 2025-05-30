export function formatBRL(value: string): string {
    const num = parseFloat(value);
    if (isNaN(num)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,   // sempre mostrar 2 casas decimais
      maximumFractionDigits: 2,
    }).format(num);
  }
  