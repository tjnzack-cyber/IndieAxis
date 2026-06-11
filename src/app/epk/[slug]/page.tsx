import EPKView from '@/components/EPKView';
import { use } from 'react';

export default function PublicEPKPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return <EPKView slug={slug} />;
}
