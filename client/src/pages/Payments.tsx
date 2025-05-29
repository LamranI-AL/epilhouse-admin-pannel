import { Card, CardContent } from '@/components/ui/card';

export default function Payments() {
  return (
    <div className="space-y-8">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Gestion des Paiements
          </h2>
        </div>
      </div>

      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">
            La page de gestion des paiements sera bientôt disponible.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
