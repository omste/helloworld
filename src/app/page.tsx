import { Background } from "@/components/atoms/Background/Background";
import { ContentBox } from "@/components/molecules/ContentBox/ContentBox";
import { ErrorBoundary } from "@/components/atoms/ErrorBoundary/ErrorBoundary";
import { getBackgroundImage } from "@/services/ImageService";
import { createMessageService } from "@/services/MessageService";

// Make this page dynamic
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const messageService = createMessageService();
  const backgroundImage = getBackgroundImage();
  let welcomeMessage;
  
  try {
    welcomeMessage = await messageService.getWelcomeMessage();
  } catch (error) {
    throw error; // Let the error boundary handle it
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <ErrorBoundary>
        <Background {...backgroundImage} />
        <ContentBox>
          {welcomeMessage.text}
        </ContentBox>
      </ErrorBoundary>
    </div>
  );
}
