import BannerCard from '@core/components/banners/banner-card';
import Link from 'next/link';
import { Text } from 'rizzui/typography';
import { PiCheckCircleFill } from 'react-icons/pi';

const features = [
  'Integração nativa com PIX e QR Code Dinâmico',
  'Gestão avançada de assinaturas e cobranças recorrentes',
  'Dashboard em tempo real com relatórios customizáveis',
  'Autenticação forte (3DS e biometria) para transações seguras',
  'API RESTful intuitiva com documentação interativa',
  'Suporte a múltiplas moedas e câmbio automático',
  'Motor de detecção de fraudes com inteligência artificial'
];

export default function UpgradeStorage({ className }: { className?: string }) {
  return (
    <div className={className}>
      <BannerCard
        title="Últimas novidades"
        className="min-h-[280px] overflow-hidden rounded-lg"
      >
        <div className="my-5">
          {features.map((feature, index) => (
            <Text
              key={`feature-${index}`}
              className="flex items-center gap-2 py-1 text-sm font-medium text-white"
            >
              <PiCheckCircleFill className="h-5 w-5 text-xl text-white" />
              {feature}
            </Text>
          ))}
        </div>
        <Link
          href={'/file'}
          className="inline-block rounded-md bg-white px-4 py-2.5 text-sm font-medium text-gray-900 dark:bg-gray-100"
        >
          Ver mais
        </Link>
      </BannerCard>
    </div>
  );
}
