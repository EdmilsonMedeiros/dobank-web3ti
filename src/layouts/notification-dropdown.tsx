"use client";

import React, {
  ReactElement,
  RefObject,
  useState,
  useEffect,
} from "react";
import { useSession } from "next-auth/react";
import { useMedia } from "@core/hooks/use-media";
import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Popover, Text, Title } from "rizzui";
import { SlExclamation } from "react-icons/sl";

dayjs.extend(relativeTime);

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL!;

interface Notification {
  id: number;
  title: string;
  click_url: string;
  created_at: string;
  read_status: number;
}

function NotificationsList({
  setIsOpen,
}: {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.accessToken) return;

    (async () => {
      try {
        const res = await fetch(
          `${apiBase}/user/notifications`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.user.accessToken}`,
            },
          }
        );
        if (!res.ok) throw new Error("Falha ao carregar notificações");
        const data = await res.json();
        setNotifications(data.notifications || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [session]);

  if (loading) {
    return (
      <div className="w-[320px] p-6 text-center">
        <Text>Carregando notificações…</Text>
      </div>
    );
  }

  return (
    <div className="w-[320px] text-left sm:w-[360px] 2xl:w-[420px] rtl:text-right">
      <div className="mb-3 flex items-center justify-between ps-6">
        <Title as="h5" fontWeight="semibold">
          Notificações
        </Title>
      </div>
      <div className="custom-scrollbar overflow-y-auto scroll-smooth max-h-[420px]">
        <div className="grid cursor-pointer grid-cols-1 gap-1 ps-4">
          {notifications.map((item) => (
            <Link
              key={item.id}
              href={item.click_url}
              onClick={() => setIsOpen(false)}
              className="group grid grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-md px-2 py-2 pe-3 transition-colors hover:bg-gray-100 dark:hover:bg-gray-50"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded bg-gray-100/70 p-1 dark:bg-gray-50/50 [&>svg]:h-auto [&>svg]:w-5">
                <SlExclamation />
              </div>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center">
                <div className="w-full">
                  <Text className="mb-0.5 w-11/12 truncate text-sm font-semibold text-gray-900 dark:text-gray-700">
                    {item.title}
                  </Text>
                  <Text className="ms-auto whitespace-nowrap pe-8 text-xs text-gray-500">
                    {dayjs(item.created_at).fromNow(true)}
                  </Text>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <Link
        href="#"
        onClick={() => setIsOpen(false)}
        className="-me-6 block px-6 pb-0.5 pt-3 text-center hover:underline"
      >
        Ver mais
      </Link>
    </div>
  );
}

export default function NotificationDropdown({
  children,
}: {
  children: ReactElement & { ref?: RefObject<any> };
}) {
  const isMobile = useMedia("(max-width: 480px)", false);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      shadow="sm"
      placement={isMobile ? "bottom" : "bottom-end"}
    >
      <Popover.Trigger>{children}</Popover.Trigger>
      <Popover.Content className="z-[9999] px-0 pb-4 pe-6 pt-5 dark:bg-gray-100 [&>svg]:hidden [&>svg]:dark:fill-gray-100 sm:[&>svg]:inline-flex">
        <NotificationsList setIsOpen={setIsOpen} />
      </Popover.Content>
    </Popover>
  );
}
