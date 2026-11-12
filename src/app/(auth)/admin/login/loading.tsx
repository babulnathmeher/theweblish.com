import "@/app/admin.css";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function LoginLoading() {
  return <main className="admin-login-loading"><LoadingSpinner label="Loading sign in" /></main>;
}
