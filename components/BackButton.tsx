import { Pressable, Text } from "react-native";
import { useRouter } from "expo-router";

type BackButtonProps = {
  fallbackRoute: string;
  label?: string;
  className?: string;
  iconClassName?: string;
};

export function BackButton({
  fallbackRoute,
  label = "←",
  className,
  iconClassName,
}: BackButtonProps) {
  const router = useRouter();

  return (
    <Pressable
      className={
        className ??
        "mr-3 h-10 w-10 items-center justify-center rounded-full border border-line bg-card dark:border-line-dark dark:bg-card-dark"
      }
      onPress={() => {
        // if (router.canGoBack()) {
        //   router.back();
        //   return;
        // }
        router.replace(fallbackRoute);
      }}
    >
      <Text
        className={iconClassName ?? "text-[18px] text-ink dark:text-ink-dark"}
      >
        {label}
      </Text>
    </Pressable>
  );
}
