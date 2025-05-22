import { useTranslations } from 'next-intl';

export default function Home() {
  const t = useTranslations('Index');

  return <main>{t('title')}</main>;
}
