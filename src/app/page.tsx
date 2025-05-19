import { Background } from "@/components/atoms/Background/Background";
import { ContentBox } from "@/components/molecules/ContentBox/ContentBox";
import { ErrorBoundary } from "@/components/atoms/ErrorBoundary/ErrorBoundary";
import { ImageService } from "@/services/ImageService";
import { MessageService } from "@/services/MessageService";
import { TRPCClientError } from '@trpc/client';

export default async function Home() {
  const imageService = ImageService.getInstance();
  const messageService = MessageService.getInstance();
  
  const backgroundImage = imageService.getBackgroundImage();
  let welcomeMessage;
  
  try {
    welcomeMessage = await messageService.getWelcomeMessage();
  } catch (error) {
    // During build time, we'll use a default message
    if (process.env.NODE_ENV === 'production' && error instanceof TRPCClientError) {
      welcomeMessage = { content: 'Welcome to our application!' };
    } else {
      throw error;
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <ErrorBoundary>
        <Background {...backgroundImage} />
        <ContentBox>
          {welcomeMessage.content}
        </ContentBox>
      </ErrorBoundary>
    </div>
  );
}
