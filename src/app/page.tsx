import { Background } from "@/components/atoms/Background/Background";
import { ContentBox } from "@/components/molecules/ContentBox/ContentBox";
import { ErrorBoundary } from "@/components/atoms/ErrorBoundary/ErrorBoundary";
import { ImageService } from "@/services/ImageService";
import { MessageService } from "@/services/MessageService";

export default async function Home() {
  const imageService = ImageService.getInstance();
  const messageService = MessageService.getInstance();
  
  const backgroundImage = imageService.getBackgroundImage();
  let welcomeMessage;
  
  try {
    console.log('🎯 Page component: Fetching welcome message...');
    welcomeMessage = await messageService.getWelcomeMessage();
    console.log('✨ Page component: Received message:', welcomeMessage);
  } catch (error) {
    console.error('❌ Page component: Error fetching message:', error);
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
