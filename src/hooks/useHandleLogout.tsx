import { baseApi } from "@/redux/api/baseApi";
import { useLogoutMutation } from "@/redux/api/userApi";
import { logout } from "@/redux/authSlice";
import { useAppDispatch } from "@/redux/store";
import { errorMessageGenerator } from "@/utils/errorMessageGenerator";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useHandleLogout = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [logoutApi] = useLogoutMutation();

  const handleLogout = async () => {
    const toastId = toast.loading("Logging out...");
    try {
      await logoutApi(undefined).unwrap();
      toast.info("Logged Out!!", { id: toastId });
    } catch (error) {
      toast.error(errorMessageGenerator(error), { id: toastId });
    } finally {
      dispatch(baseApi.util.resetApiState());
      dispatch(logout());
      router.push("/auth/sign-in");
    }
  };
  return handleLogout;
};
