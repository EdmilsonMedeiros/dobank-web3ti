// app/landing/page.tsx
'use client'

import Link from 'next/link'
import { Title, Text } from 'rizzui/typography'
import { Button } from 'rizzui/button'
import HeroIllustration from '@public/shop-illustration.png'
import Image from 'next/image'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-16">
      <div className="max-w-3xl text-center space-y-6">
        <Title as="h1" className="text-4xl md:text-5xl font-bold">
          Bem-vindo ao Dobank
        </Title>
        <Text className="text-lg text-gray-600">
          A solução mais simples para gerenciar seus pagamentos e seu negócio.
        </Text>
        <div className="mt-8">
          <Link href="/signin" passHref>
            <Button size="lg" className="px-8 py-4">
              Entrar na Minha Conta
            </Button>
          </Link>
        </div>
      </div>
      <div className="mt-12 w-full flex justify-center">
        <div className="w-full max-w-lg">
          <Image
            src={HeroIllustration}
            alt="Ilustração de bem-vindo"
            placeholder="blur"
            className="object-contain"
          />
        </div>
      </div>
    </div>
  )
}
