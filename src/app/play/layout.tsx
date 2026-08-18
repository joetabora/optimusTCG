export default function PlayLayout({ children }: LayoutProps<"/play">) {
  return (
    <div className="dark h-dvh overflow-hidden">
      {children}
    </div>
  );
}
