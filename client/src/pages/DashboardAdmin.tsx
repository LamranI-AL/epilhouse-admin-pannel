/** @format */

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  User,
  TrendingUp,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  Activity,
  MapPin,
  Zap,
  RefreshCw,
  Eye,
  Filter,
  Download,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  AreaChart,
  Area,
  Pie,
} from "recharts";
import { useAuth } from "@/providers/auth-provider";
import { useBooking } from "@/hooks/use-booking";
import { QuickReservation } from "@/types";
import Bookings from "./Bookings";

const AdminDashboard = () => {
  const [bookings, setBookings] = useState<QuickReservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState("7"); // 7 jours par défaut
  const [selectedPeriod, setSelectedPeriod] = useState("Cette semaine");

  const { currentUser, agentData } = useAuth();
  const { quickBookings } = useBooking();

  // Fonction pour récupérer les données (à remplacer par votre API)
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const filteredBookings = quickBookings.filter(
        (booking: any) => booking?.agent?.id === currentUser?.uid,
      );
      setBookings(filteredBookings);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [Bookings]);

  // Calculs des statistiques
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(
    (b) => b.status === "confirmed",
  ).length;
  const pendingBookings = bookings.filter((b) => b.status === "pending").length;
  const cancelledBookings = bookings.filter(
    (b) => b.status === "cancelled",
  ).length;
  const completedBookings = bookings.filter(
    (b) => b.status === "confirmed",
  ).length;

  const totalRevenue = bookings
    // .filter((b) => b.status === "confirmed" || b.status === "pending")
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const averageBookingValue =
    totalBookings > 0 ? totalRevenue / totalBookings : 0;

  // Données pour les graphiques
  const statusData = [
    {
      name: "Confirmé",
      value: confirmedBookings,
      color: "#10B981",
      count: confirmedBookings,
    },
    {
      name: "En attente",
      value: pendingBookings,
      color: "#F59E0B",
      count: pendingBookings,
    },
    {
      name: "Terminé",
      value: completedBookings,
      color: "#3B82F6",
      count: completedBookings,
    },
    {
      name: "Annulé",
      value: cancelledBookings,
      color: "#EF4444",
      count: cancelledBookings,
    },
  ];

  // Données par service
  const serviceStats = bookings.reduce((acc, booking: any) => {
    booking.selectedServices.forEach((service: any) => {
      const serviceName = service.name || "Service Inconnu";
      if (!acc[serviceName]) {
        acc[serviceName] = { name: serviceName, count: 0, revenue: 0 };
      }
      acc[serviceName].count += 1;
      if (booking.status === "confirmed" || booking.status === "pending") {
        acc[serviceName].revenue += booking.totalAmount;
      }
    });
    return acc;
  }, {} as Record<string, { name: string; count: number; revenue: number }>);

  const serviceData = Object.values(serviceStats);

  // Données par jour (derniers 7 jours)
  const dailyData = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split("T")[0];
    const dayBookings = bookings.filter((b) => b.selectedDate === dateString);

    dailyData.push({
      date: date.toLocaleDateString("fr-FR", {
        weekday: "short",
        day: "numeric",
      }),
      reservations: dayBookings.length,
      revenue: dayBookings
        .filter((b) => b.status === "confirmed" || b.status === "pending")
        .reduce((sum, b) => sum + b.totalAmount, 0),
    });
  }

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    subtitle,
    trend,
  }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div
          className={`p-3 rounded-full ${color
            .replace("text-", "bg-")
            .replace("600", "100")}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
          <span className="text-green-600 font-medium">{trend}</span>
          <span className="text-gray-500 ml-1">vs période précédente</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Activity className="w-8 h-8 mr-3 text-teal-600" />
              Dashboard Agent
            </h1>
            <p className="text-gray-600 mt-1">
              Bonjour{" "}
              <strong>
                {agentData && agentData.firstName}{" "}
                {agentData && agentData.lastName}
              </strong>{" "}
              - Voici un aperçu de vos rendez-vous assignés
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500">
              <option value="7">7 derniers jours</option>
              <option value="30">30 derniers jours</option>
              <option value="90">3 derniers mois</option>
            </select>
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50">
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              {loading ? "Actualisation..." : "Actualiser"}
            </button>
          </div>
        </div>
      </div>

      {/* Info Agent */}
      <div className="mb-6 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-full">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Agent assigné</h3>
              <p className="text-teal-100">ID: {currentUser?.uid}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 text-teal-100">
              <MapPin className="w-4 h-4" />
              <span>Location: {agentData && agentData.assignedLocationId}</span>
            </div>
            <p className="text-sm text-teal-100 mt-1">
              Filtrage actif sur vos rendez-vous assignés
            </p>
          </div>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Rendez-vous"
          value={totalBookings}
          icon={Calendar}
          color="text-blue-600"
          subtitle={`${selectedPeriod}`}
          trend="+12%"
        />
        <StatCard
          title="Revenus Générés"
          value={`${totalRevenue.toFixed(0)}€`}
          icon={DollarSign}
          color="text-green-600"
          subtitle={`Moyenne: ${averageBookingValue.toFixed(0)}€`}
          trend="+8%"
        />
        <StatCard
          title="Taux de Confirmation"
          value={`${
            totalBookings > 0
              ? Math.round((confirmedBookings / totalBookings) * 100)
              : 0
          }%`}
          icon={CheckCircle}
          color="text-emerald-600"
          subtitle={`${confirmedBookings} confirmés`}
          trend="+5%"
        />
        <StatCard
          title="En Attente"
          value={pendingBookings}
          icon={AlertCircle}
          color="text-orange-600"
          subtitle="À traiter"
        />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Évolution des réservations */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-teal-600" />
              Évolution des Réservations
            </h3>
            <span className="text-sm text-gray-500">7 derniers jours</span>
          </div>
          <ResponsiveContainer
            width="100%"
            height={300}>
            <AreaChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="reservations"
                stroke="#0D9488"
                fill="#0D9488"
                fillOpacity={0.3}
                name="Réservations"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Répartition par statut */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <PieChart className="w-5 h-5 mr-2 text-teal-600" />
              Répartition par Statut
            </h3>
          </div>
          <ResponsiveContainer
            width="100%"
            height={300}>
            <RechartsPieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }>
                {statusData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                  />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {statusData.map((item, index) => (
              <div
                key={index}
                className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-gray-600">
                  {item.name}: {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Services et Revenus */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Services les plus demandés */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-teal-600" />
            Services les Plus Demandés
          </h3>
          <ResponsiveContainer
            width="100%"
            height={300}>
            <BarChart data={serviceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="count"
                fill="#0D9488"
                name="Nombre de réservations"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenus par jour */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-teal-600" />
            Revenus par Jour
          </h3>
          <ResponsiveContainer
            width="100%"
            height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value}€`, "Revenus"]} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#059669"
                strokeWidth={3}
                dot={{ fill: "#059669", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Prochains rendez-vous */}
      <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-teal-600" />
            Prochains Rendez-vous
          </h3>
          <button className="flex items-center px-4 py-2 text-teal-600 border border-teal-600 rounded-lg hover:bg-teal-50">
            <Eye className="w-4 h-4 mr-2" />
            Voir tous
          </button>
        </div>

        <div className="space-y-4">
          {bookings
            .filter((b) => new Date(b.selectedDate) >= new Date())
            .sort(
              (a, b) =>
                new Date(a.selectedDate).getTime() -
                new Date(b.selectedDate).getTime(),
            )
            .slice(0, 5)
            .map((booking: any, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-teal-100 rounded-full">
                    <User className="w-4 h-4 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {booking.clientFirstName} {booking.clientLastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {booking.selectedServices[0]?.name || "Service"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {new Date(booking.selectedDate).toLocaleDateString("fr-FR")}
                  </p>
                  <p className="text-sm text-gray-500">
                    {booking.selectedTime}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      booking.status === "confirmed"
                        ? "bg-green-100 text-green-800"
                        : booking.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                    {booking.status === "confirmed"
                      ? "Confirmé"
                      : booking.status === "pending"
                      ? "En attente"
                      : booking.status}
                  </span>
                  <span className="font-semibold text-green-600">
                    {booking.totalAmount}€
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
