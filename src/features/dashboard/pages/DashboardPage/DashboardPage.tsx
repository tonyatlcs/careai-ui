import {
  Stethoscope,
  Calendar,
  Bed,
  Users,
  DoorClosed,
  DoorOpen,
} from "lucide-react";
import { InfoCard } from "@/components/elements/InfoCard/InfoCard";
import { MiniBarChart } from "@/components/elements/MiniBarChart/MiniBarChart";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import styles from "@/features/dashboard/pages/DashboardPage/DashboardPage.module.scss";
import { ActivityCalendarWidget } from "../../components/ActivityCalendarWidget/ActivityCalendarWidget";
import { PatientOverviewWidget } from "../../components/PatientOverviewWidget/PatientOverviewWidget";

export function DashboardPage() {
  return (
    <>
      <section className="grid grid-cols-4 gap-4">
        <InfoCard
          title="Total doctors"
          value="300+"
          trendPercentage="2.5%"
          trendDirection="down"
          icon={Stethoscope}
          content={<MiniBarChart />}
        />
        <InfoCard
          title="Book Appointment"
          value="15k"
          trendPercentage="20.5%"
          trendDirection="up"
          icon={Calendar}
          content={
            <div className={styles.contentContainer}>
              <p>Data for the last 7 days: 5,231 to 8,323 visitors.</p>
              <div className={styles.contentProgress}>
                <Progress value={37} />
                <p>1,456 today</p>
              </div>
            </div>
          }
        />
        <InfoCard
          title="Available patient rooms"
          value="175"
          trendPercentage="2.5%"
          trendDirection="down"
          icon={Bed}
          content={
            <div className={styles.roomBreakdown}>
              <div className={styles.roomRow}>
                <div className={styles.roomLeft}>
                  <div
                    className={cn(
                      styles.roomIconWrap,
                      styles.roomIconWrapGeneral,
                    )}
                  >
                    <DoorOpen className={styles.roomIcon} aria-hidden />
                  </div>
                  <span className={styles.roomLabel}>General room</span>
                </div>
                <span className={styles.roomValue}>100</span>
              </div>
              <div className={styles.roomRow}>
                <div className={styles.roomLeft}>
                  <div
                    className={cn(
                      styles.roomIconWrap,
                      styles.roomIconWrapPrivate,
                    )}
                  >
                    <DoorClosed className={styles.roomIcon} aria-hidden />
                  </div>
                  <span className={styles.roomLabel}>Private Room</span>
                </div>
                <span className={styles.roomValue}>75</span>
              </div>
            </div>
          }
        />
        <InfoCard
          title="Overall visitors"
          value="10k+"
          trendPercentage="2.5%"
          trendDirection="up"
          icon={Users}
          content={
            <div className={styles.contentContainer}>
              <p>Top 3 most in-demand clinics compared with last month</p>
              <div className={styles.contentProgress}>
                <Progress value={70} />
                <p>145 today</p>
              </div>
            </div>
          }
        />
      </section>
      <section className={styles.widgetsSection}>
        <div className={styles.widgetsColumn}>
          <PatientOverviewWidget />
        </div>
        <div className={styles.widgetsColumn}>
          <ActivityCalendarWidget />
        </div>
      </section>
    </>
  );
}
