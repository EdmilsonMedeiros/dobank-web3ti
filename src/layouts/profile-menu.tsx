'use client';

import { Title, Text, Avatar, Button, Popover } from 'rizzui';
import cn from '@core/utils/class-names';
import { routes } from '@/config/routes';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface User {
  firstname: string;
  lastname: string;
  email: string;
  image: string;
}

export default function ProfileMenu({
  buttonClassName,
  avatarClassName,
  username = false,
}: {
  buttonClassName?: string;
  avatarClassName?: string;
  username?: boolean;
}) {
  const { data: session } = useSession();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!session?.user?.accessToken) return;

    (async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/user`,
          {
            headers: {
              Authorization: `Bearer ${session.user.accessToken}`,
              'Content-Type': 'application/json',
            },
            cache: 'no-store',
          }
        );
        if (!res.ok) throw new Error('Falha ao carregar perfil');
        const { user: u } = await res.json();
        setUser(u);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [session]);

  return (
    <ProfileMenuPopover>
      <Popover.Trigger>
        <button
          className={cn(
            'w-9 shrink-0 rounded-full outline-none focus-visible:ring-[1.5px] focus-visible:ring-gray-400 focus-visible:ring-offset-2 active:translate-y-px sm:w-10',
            buttonClassName
          )}
        >
          <Avatar
            src={user?.image ?? 'https://isomorphic-furyroad.s3.amazonaws.com/public/avatars/avatar-11.webp'}
            name={user ? `${user.firstname} ${user.lastname}` : '-'}
            className={cn('!h-9 w-9 sm:!h-10 sm:!w-10', avatarClassName)}
          />
          {!!username && user && (
            <span className="username hidden text-gray-200 dark:text-gray-700 md:inline-flex">
              Olá, {user.firstname}
            </span>
          )}
        </button>
      </Popover.Trigger>

      <Popover.Content className="z-[9999] p-0 dark:bg-gray-100 [&>svg]:dark:fill-gray-100">
        <DropdownMenu user={user} />
      </Popover.Content>
    </ProfileMenuPopover>
  );
}

function ProfileMenuPopover({ children }: React.PropsWithChildren<{}>) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <Popover
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      shadow="sm"
      placement="bottom-end"
    >
      {children}
    </Popover>
  );
}

const menuItems = [
  {
    name: 'Minha Conta',
    href: routes.core.account(),
  },
  {
    name: 'Alterar Senha',
    href: routes.core.password(),
  },
];

function DropdownMenu({ user }: { user: User | null }) {
  const fullName = user ? `${user.firstname} ${user.lastname}` : 'Carregando...';
  const email = user?.email ?? '—';
  const avatarSrc =
    user?.image ??
    'https://isomorphic-furyroad.s3.amazonaws.com/public/avatars/avatar-11.webp';

  return (
    <div className="w-64 text-left rtl:text-right">
      <div className="flex items-center border-b border-gray-300 px-6 pb-5 pt-6">
        <Avatar src={avatarSrc} name={fullName} />
        <div className="ms-3">
          <Title as="h6" className="font-semibold">
            {fullName}
          </Title>
          <Text className="text-gray-600">{email}</Text>
        </div>
      </div>

      <div className="grid px-3.5 py-3.5 font-medium text-gray-700">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="group my-0.5 flex items-center rounded-md px-2.5 py-2 hover:bg-gray-100 focus:outline-none hover:dark:bg-gray-50/50"
          >
            {item.name}
          </Link>
        ))}
      </div>

      <div className="border-t border-gray-300 px-6 pb-6 pt-5">
        <Button
          className="h-auto w-full justify-start p-0 font-medium text-gray-700 outline-none focus-within:text-gray-600 hover:text-gray-900 focus-visible:ring-0"
          variant="text"
          onClick={() => signOut()}
        >
          Sair
        </Button>
      </div>
    </div>
  );
}
