export const servicePages = {
  "web-design-company-in-bhubaneswar": {
    title: "Web design in Bhubaneswar", eyebrow: "Web design", intro: "Discuss the structure, visual direction, and experience your website needs.",
    topics: [["Audience", "Who needs to use the site, and what are they trying to do?"], ["Page structure", "Which pages and journeys matter most?"], ["Visual direction", "What existing brand material or references should inform the design?"]],
  },
  "landing-page-design": {
    title: "Landing page design", eyebrow: "Landing pages", intro: "Plan a focused page around one offer, audience, and next action.",
    topics: [["Offer", "What is the page asking visitors to consider?"], ["Message", "What information helps visitors make a decision?"], ["Response", "What should happen after someone submits or clicks?"]],
  },
  "logo-design": {
    title: "Logo design", eyebrow: "Brand design", intro: "Start a conversation about the identity your business needs to communicate.",
    topics: [["Business context", "What should the identity represent?"], ["Existing material", "Are there colors, names, or assets to preserve?"], ["Use cases", "Where will the mark need to work?"]],
  },
  "web-development-company-in-bhubaneswar": {
    title: "Web development in Bhubaneswar", eyebrow: "Web development", intro: "Discuss the functionality, content, and technical requirements of your web project.",
    topics: [["Requirements", "What must the site or application do?"], ["Content", "What material and data will be needed?"], ["Integrations", "Which existing tools or systems should be considered?"]],
  },
  "wordpress-development-company-in-bhubaneswar": {
    title: "WordPress development in Bhubaneswar", eyebrow: "WordPress", intro: "Discuss a WordPress site, migration, or update around your editorial needs.",
    topics: [["Editing", "Who will maintain the content?"], ["Structure", "Which page types and content relationships are needed?"], ["Existing site", "Is there material or a setup to keep or migrate?"]],
  },
  "seo-company-in-bhubaneswar": {
    title: "SEO in Bhubaneswar", eyebrow: "Search visibility", intro: "Talk about your current website, search goals, and the work that may be appropriate.",
    topics: [["Current site", "What pages and content are already published?"], ["Audience", "What searches are relevant to your business?"], ["Measurement", "How will progress be reviewed without promising a ranking outcome?"]],
  },
  "marketing-company-in-bhubaneswar": {
    title: "Digital marketing in Bhubaneswar", eyebrow: "Digital marketing", intro: "Bring your audience, channels, and business goals into one conversation.",
    topics: [["Goals", "What outcome are you trying to support?"], ["Channels", "Where are you currently reaching customers?"], ["Review", "What information is available to guide decisions?"]],
  },
  "facebook-marketing": {
    title: "Facebook marketing", eyebrow: "Social marketing", intro: "Discuss your audience, creative material, and objectives for Facebook marketing.",
    topics: [["Audience", "Who are you trying to reach?"], ["Creative", "What approved images, copy, and offers are available?"], ["Measurement", "Which actions matter to your business?"]],
  },
  "google-analytics": {
    title: "Google Analytics", eyebrow: "Measurement", intro: "Discuss what you want to understand about website use and reporting.",
    topics: [["Questions", "What decisions should the data help you make?"], ["Current setup", "What analytics and consent tools are already in place?"], ["Reporting", "Which events or measures would be useful to review?"]],
  },
} as const;

export type ServiceSlug = keyof typeof servicePages;
