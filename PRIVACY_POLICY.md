# Privacy Policy: Ad Waste Finder

**Last Updated:** November 13, 2026  
**Effective Date:** November 13, 2026  
**Product:** Ad Waste Finder (operated by the "Company", "we", "our", or "us")  
**Compliance Standards:** General Data Protection Regulation (GDPR / UK GDPR), California Consumer Privacy Act / California Privacy Rights Act (CCPA / CPRA), and the Digital Personal Data Protection Act, 2023 (India DPDP).

---

## 1. Introduction and Scope

Ad Waste Finder ("Service", "Application", or "Platform") is an evidence-based advertising analytics and waste surveillance web application. This Privacy Policy governs the collection, processing, storage, and protection of data collected when users ("Advertiser", "User", "you") access our application, connect ad network API credentials, upload campaign data, or use our statistical analysis features.

By accessing or using Ad Waste Finder, you acknowledge that you have read, understood, and agreed to the practices described in this Privacy Policy.

---

## 2. Fundamental Architectural Principle: Zero Consumer End-User PII

> **IMPORTANT PRIVACY SHIELD:**  
> Ad Waste Finder is an aggregated campaign-level surveillance tool. **We do NOT collect, process, inspect, capture, store, or sell any Personally Identifiable Information (PII) belonging to your customers or the individuals who view or click your advertisements.**
>
> Our service does not receive or store:
> - Individual consumer names, email addresses, physical addresses, or phone numbers;
> - Consumer IP addresses, MAC addresses, device fingerprints, or browser fingerprints;
> - Payment card numbers, bank account numbers, or billing data of your customers;
> - Individual clickstream trails, browsing histories, or behavioral profiles of your website visitors.
>
> All telemetry processed by Ad Waste Finder is strictly aggregated numerical campaign metadata (e.g., aggregate daily spend, total impressions, total click counts, total conversion counts, and campaign names).

---

## 3. Categories of Information We Process

### 3.1 Account and Contact Information
When you register, create an account, or contact support, we collect:
- Full Name;
- Business or Work Email Address;
- Organization or Company Name;
- Account authentication credentials and session tokens.

### 3.2 Third-Party Ad Platform Credentials (API Identifiers)
When you choose to connect a live advertising account via our Live Ads Account feature, we receive and securely process:
- Third-Party Ad Network Account Identifiers (e.g., Google Ads 10-digit Customer ID, Meta Ad Account ID `act_xxx`, LinkedIn Ad Account ID);
- Developer API Tokens, System User Access Tokens, and OAuth 2.0 refresh/access tokens;
- Organization currency setting (e.g., INR, USD, EUR) and target benchmark CPA/ROAS thresholds.

### 3.3 Aggregated Advertising Campaign Telemetry
Through API polling or CSV data ingestion, we process:
- Campaign identifiers, campaign names, channel types (e.g., Search, PMax, YouTube, Meta Feed);
- Campaign optimization goals (e.g., Conversions, Awareness, Traffic);
- Daily aggregate metrics: daily spend, impression count, click count, conversion count, aggregate conversion value/revenue, and budget exhaustion fraction;
- Maturity flags and historical date timestamps.

### 3.4 Platform Usage and Audit Logs
To guarantee security and human accountability, we record:
- System audit entries: timestamps and user identifiers associated with recommendation decisions (`Approve`, `Dismiss`, `Snooze`), setting changes, and scenario triggers;
- Application performance telemetry: error logs, API sync latency, and HTTP response codes.

---

## 4. How We Use Processed Data

We process the aforementioned data strictly for the following purposes:
1. **Mathematical Bayesian Analysis & Waste Detection:** Executing Beta-distribution Monte Carlo simulations ($N=10,000$) and 6-rule classification pipelines to quantify direct ad waste;
2. **Generating Conservative Reallocations:** Computing recommended 25% daily budget shifts from weak campaigns to high-performing conversion engines, applying 20% diminishing returns modeling;
3. **On-Demand Funnel Diagnostics:** Evaluating campaign sub-metrics (CTR, CVR, CPC) against benchmarks to suggest tactical remediation steps (creative refresh, landing page scent, audience exclusions);
4. **Tamper-Evident Audit Trails:** Maintaining a transparent ledger of all user actions for organizational compliance and team governance;
5. **Security & Fraud Prevention:** Detecting unauthorized API requests, rate-limit violations, and ensuring operational stability.

---

## 5. Third-Party Platform Policies and API Disclosures

### 5.1 Google Ads API & Google API Services User Data Policy
Ad Waste Finder's use and transfer to any other app of information received from Google APIs adheres to the **Google API Services User Data Policy**, including the **Limited Use requirements**:
- We request only the minimal permissions required to read reporting metrics (`adwords` or `googleads` read-only scopes);
- We do not use Google user data to train generalized AI/ML models without explicit user consent;
- We do not transfer or disclose Google API data to third-party data brokers or advertisers.

### 5.2 Meta Marketing API Disclosures
Ad Waste Finder accesses Meta Ad Account data in accordance with the **Meta Platform Terms** and **Developer Policies**:
- API tokens are restricted to retrieving aggregate ad performance metrics for campaigns owned or managed by the authorized user;
- No Meta user or advertising data is commingled, shared with competitors, or used for surveillance.

---

## 6. Zero Commercialization and No-Sale Commitment

> **WE DO NOT SELL YOUR DATA.**  
> Ad Waste Finder will never sell, lease, rent, trade, or monetize your advertising spend, campaign names, conversion volumes, or performance metrics to third parties, competitors, marketing agencies, or data brokers.

---

## 7. Data Storage, Security, and Encryption Standards

We employ industry-leading administrative, technical, and physical safeguards:
- **Encryption in Transit:** All communications with third-party ad networks and user browsers are enforced over HTTPS utilizing TLS 1.3 encryption.
- **Client-Side Credential Masking:** API keys, developer tokens, and access secrets are masked within user interface inputs with togglable visibility.
- **Principle of Least Privilege:** Production databases and server environments have restricted access controlled by strict multi-factor authentication.
- **Read-Only Enforced Architecture:** The application operates strictly as a read-only analytics consumer. The backend does not possess or execute write, update, pause, or mutation privileges against third-party ad accounts.

---

## 8. Data Retention, Account Disconnection, and Right to Erasure

1. **Immediate API Token Purging:** When a user clicks **"Disconnect Live Account"**, all associated developer tokens, access tokens, and API credentials are immediately purged from active memory and backend data sources.
2. **Data Retention Period:** Aggregated daily campaign metrics are retained only for the active duration of the user's subscription or workspace to support 14-day rolling window trends.
3. **Right to Erasure ("Right to Be Forgotten"):** Users may request complete deletion of their account, historical metrics, and audit logs at any time by contacting our privacy team. Deletion will be completed within 30 calendar days.

---

## 9. Global Privacy Rights and Regulatory Disclosures

### 9.1 European Economic Area (EEA) and United Kingdom (UK) GDPR
If you access the Service from the EEA or UK, your processing is grounded in **Article 6(1)(b) (Contractual Necessity)** and **Article 6(1)(f) (Legitimate Interests)**. You possess the following rights:
- **Right of Access (Article 15):** Request a copy of the personal and account data we hold;
- **Right to Rectification (Article 16):** Request correction of inaccurate information;
- **Right to Erasure (Article 17):** Request deletion of your personal data;
- **Right to Restriction of Processing (Article 18):** Restrict how your data is processed;
- **Right to Data Portability (Article 20):** Receive your data in a structured, machine-readable format;
- **Right to Object (Article 21):** Object to processing based on legitimate interests;
- **Right to Lodge a Complaint:** File a grievance with your local supervisory authority.

### 9.2 California Privacy Rights (CCPA / CPRA)
For California residents:
- We do not "sell" personal information as defined by the CCPA;
- We do not "share" personal information for cross-context behavioral advertising;
- You have the right to know what personal information has been collected, the right to delete it, and the right not to be discriminated against for exercising your privacy rights.

### 9.3 Digital Personal Data Protection Act, 2023 (India)
For users in India:
- Personal data (contact details and authentication identifiers) is processed strictly for lawful purposes with consent or deemed consent under the DPDP Act, 2023;
- Users retain the right to access summary information, correct inaccurate data, and nominate representatives.

---

## 10. Cookies and Tracking Technologies

Ad Waste Finder does not deploy third-party advertising cookies, cross-domain behavioral tracking pixels, or third-party profiling scripts on user dashboards. We use strictly necessary session cookies and local storage items essential for:
- Maintaining secure authentication sessions;
- Remembering workspace UI preferences (e.g., active tab selection, table density, simulation speed).

---

## 11. Amendments to this Privacy Policy

We reserve the right to modify or update this Privacy Policy periodically to reflect technological improvements, legal changes, or service enhancements. If we make material modifications, we will notify users through an in-app banner or via email prior to the changes taking effect. Continued use of the Application following the publication of changes constitutes acceptance.

---

## 12. Contact Information and Data Protection Officer

For privacy inquiries, data subject access requests (DSAR), or questions regarding this Privacy Policy, please contact our Data Protection Office:

- **Entity:** Ad Waste Finder Compliance & Privacy Division
- **Email:** `privacy@adwastefinder.app`
- **Support Portal:** `https://adwastefinder.app/support`
- **Response Window:** All formal privacy and deletion requests receive an initial response within 72 hours and resolution within 30 days.
