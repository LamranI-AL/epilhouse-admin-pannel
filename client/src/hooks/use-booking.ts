/** @format */
import { useState, useEffect } from "react";
import { getAllBookings, getAllQuickBookings } from "@/actions/Bookings";

export const useBooking = () => {
  const [quickBookings, setQuickBookings] = useState<any[]>([]);
  const [detailedBookings, setDetailedBookings] = useState<any[]>([]);
  const [todayBookings, setTodayBookings] = useState<any[]>([]);
  const [revenue, setRevenue] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reservationEnCours, setReservationEnCours] = useState<any[]>([]);
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const result = await getAllQuickBookings();
        setQuickBookings(result.quickBookings || []);
        return result.quickBookings;
      } catch (err) {
        setError("Erreur lors du chargement des services");
        console.error("Error fetching services:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchDetailedBookings = async () => {
      try {
        const result = await getAllBookings();
        setDetailedBookings(result.bookings || []);
      } catch (err) {
        setError("Erreur lors du chargement des rendez-vous");
        console.error("Error fetching detailed bookings:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchTodayBookings = async () => {
      try {
        const result = await getAllQuickBookings();
        const today = new Date();
        const todayBookings = result?.quickBookings?.filter((booking: any) => {
          //   console.log(booking);
          //   console.log(today);
          //   get date from firbase timestamp and mutch with day of today
          const bookingDate = new Date(booking.createdAt.toDate());
          //   console.log(bookingDate);
          return bookingDate.toDateString() === today.toDateString();
        });
        setTodayBookings(todayBookings || []);
      } catch (err) {
        setError("Erreur lors du chargement des rendez-vous");
        console.error("Error fetching today bookings:", err);
      } finally {
        setLoading(false);
      }
    };
    const fetchRevenue = async () => {
      // revenue of today
      setLoading(true);
      try {
        const result = await getAllQuickBookings();
        const today = new Date();
        const todayBookings = result?.quickBookings?.filter((booking: any) => {
          const bookingDate = new Date(booking.createdAt.toDate());
          return bookingDate.toDateString() === today.toDateString();
        });
        const revenue = todayBookings?.reduce(
          (acc: number, booking: any) => acc + parseFloat(booking.totalAmount),
          0,
        );
        setRevenue(revenue || 0);
      } catch (err) {
        setError("Erreur lors du chargement des revenus");
        console.error("Error fetching revenue:", err);
      } finally {
        setLoading(false);
      }
    };
    const fetchReservationEnCours = async () => {
      try {
        const result = await getAllQuickBookings();
        const reservationEnCours = result?.quickBookings?.filter(
          (booking: any) => booking.status === "pending",
        );
        setReservationEnCours(reservationEnCours || []);
      } catch (err) {
        setError("Erreur lors du chargement des rendez-vous en cours");
        console.error("Error fetching reservation en cours:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
    fetchDetailedBookings();
    fetchTodayBookings();
    fetchRevenue();
    fetchReservationEnCours();
  }, []);

  return {
    quickBookings,
    detailedBookings,
    todayBookings,
    loading,
    error,
    revenue,
    reservationEnCours,
  };
};
