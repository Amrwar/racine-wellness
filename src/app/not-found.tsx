import { Arrow, Button, Container, Eyebrow, Heading, Lead } from "@/components/ui";

export default function NotFound() {
  return (
    <section className="flex min-h-[80svh] items-center pt-24">
      <Container>
        <div className="max-w-2xl">
          <Eyebrow>404</Eyebrow>
          <Heading as="h1">This page took a rest day.</Heading>
          <Lead className="mt-6">
            The page you’re looking for doesn’t exist or has moved. Let’s get you back on track.
          </Lead>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button href="/">
              Back to home <Arrow />
            </Button>
            <Button href="/contact" variant="ghost">
              Contact us
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
