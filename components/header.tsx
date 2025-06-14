import {
  SignedIn,
  SignedOut,
  SignInButton,
  useAuth,
  UserButton,
} from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { PenBox } from "lucide-react";
import UserMenu from "./user-menu";
import { checkUser } from "@/lib/checkUser";
import UserLoading from "./user-loading";
import Notification from "./notification";
const Header = async () => {
  const user = await checkUser();

  return (
    <header>
      <nav className="py-6 px-4 flex justify-between items-center">
        <Link href="/">
          <Image
            src={`/logo2.png`}
            alt="Zcrum logo"
            width={200}
            height={56}
            className="h-10 w-auto object-contain"
          />
        </Link>
        <div className="flex items-center gap-4">
          <SignedIn>
            <Link href="/project/create">
              <Button variant="secondary" className="flex items-center gap-2">
                <PenBox size={18} />
                <span>Create Project</span>
              </Button>
            </Link>
          </SignedIn>
          <SignedOut>
            <SignInButton forceRedirectUrl="/onboarding">
              <Button variant="outline">Login</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>{user?.id && <Notification userId={user?.id} />}</SignedIn>
          <SignedIn>
            <UserMenu />
          </SignedIn>
        </div>
      </nav>
      <UserLoading />
    </header>
  );
};

export default Header;
