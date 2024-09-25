# User authentication using credentials with Paradym

This demo also uses the [Paradym Wallet](https://docs.paradym.id/integrating-with-a-holder-wallet/paradym-wallet), an open-source companion app to the Paradym platform available on the [Apple App Store](https://apps.apple.com/nl/app/paradym-wallet/id6449846111?l=en) and [Google Play Store](https://play.google.com/store/apps/details?id=id.paradym.wallet).

## Prerequisites

**Register the credential**

First, we need to register the credential template. In this template, we define the properties of the credential we want to issue in our application.

#### Step 3: Set your Paradym Project ID

You can find your Paradym Project ID in the settings tab on the Paradym dashboard

#### Step 4: Create your Paradym API Key

You can generate your API key in the settings tab on the Paradym dashboard as described [here](https://docs.paradym.id/executing-a-workflow/api-execution#api-key).

#### Step 5: Set the environment variables

The environment variables consist of your Paradym API Key, Paradym project ID.

```bash
cp .env.example .env
```

## Running the demo

Make sure to install the dependencies:

```bash
# bun
bun install
```

Initiate the data storage

```bash
npm exec drizzle-kit push:sqlite
```

You can then run the development server:

```bash
# bun
bun run dev
```

Open [http://localhost:3000](http://localhost:3000/sign-up) with your browser to see the result.
