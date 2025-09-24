
import "../globals.css";
import AppLayout from "@/components/layout/layout";



export default function ShellLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    

            <AppLayout>
                  {children}
            </AppLayout>
          
         
      
  );
}
