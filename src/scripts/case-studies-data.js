/**
 * VIKRAM.DEV — Case Studies Data (4 Featured Projects)
 */
export const caseStudiesData = [
  {
    id: 'machine-knitters-guild',
    number: 'CASE STUDY 01',
    title: 'Machine Knitters Guild',
    tagline: 'Custom Square Payment & Membership Gateway Plugin',
    category: 'E-COMMERCE & MEMBERSHIP',
    image: '/assets/project-knitting.jpg',
    synopsis: 'Engineered a standalone, high-security WordPress plugin connecting directly to the Square Payment API for automated membership subscriptions, renewals, and protected tier access.',
    problem: 'The organization was struggling with bloated third-party membership plugins that suffered from high database overhead, checkout friction, and poor payment error recovery, leading to lost membership renewals.',
    solution: 'Built a lightweight, object-oriented custom WordPress plugin from scratch. Interfaced with Square Web Payments SDK, implemented tokenized recurring card transactions, stored encrypted membership ledgers in optimized custom MySQL tables, and created automated webhook listeners.',
    metrics: [
      { label: 'Renewal Automation', value: '100%' },
      { label: 'Plugin Execution Time', value: '< 28ms' },
      { label: 'Transaction Success', value: '99.98%' },
      { label: 'Bloat Reduction', value: '-85%' }
    ],
    techStack: ['PHP 8.2 (OOP)', 'Square API', 'Custom WP Plugin', 'MySQL Vault', 'Webhooks', 'AJAX'],
    codeSnippet: `// Square Tokenized Membership Charge Handler
public function process_square_subscription($user_id, $nonce, $tier_id) {
    global $wpdb;
    $amount_cents = $this->get_tier_amount_cents($tier_id);
    
    $payment_request = new CreatePaymentRequest(
        $nonce,
        uniqid('MKG_SUB_'),
        new Money($amount_cents, 'USD')
    );
    $payment_request->setCustomerId($this->get_or_create_square_customer($user_id));
    
    $response = $this->square_client->getPaymentsApi()->createPayment($payment_request);
    
    if ($response->isSuccess()) {
        $this->activate_membership($user_id, $tier_id, $response->getResult()->getPayment());
        return ['status' => 'success', 'redirect' => home_url('/members-dashboard/')];
    }
    return ['status' => 'error', 'message' => $response->getErrors()[0]->getDetail()];
}`
  },
  {
    id: '360-web-designs',
    number: 'CASE STUDY 02',
    title: '360 Web Designs',
    tagline: 'High-Velocity AJAX Filtering & Dynamic "Load More" Engine',
    category: 'PERFORMANCE & UX',
    image: '/assets/project-360web.svg',
    synopsis: 'Architected an asynchronous client-side filtering system and dynamic content loader for a creative web agency, eliminating full page reloads and slashing load times.',
    problem: 'The agency portfolio contained over 100+ media-rich case studies. Navigating categories triggered heavy full page refreshes, resulting in high bounce rates and 4+ second page load times on mobile devices.',
    solution: 'Designed a headless-style AJAX filtering architecture utilizing WordPress Transients caching and custom lightweight JSON endpoints. Integrated smooth layout transitions, pushState URL synchronization, and lazy-loaded WebP media feeds.',
    metrics: [
      { label: 'Initial Payload Drop', value: '78%' },
      { label: 'Filter Response Time', value: '18ms' },
      { label: 'Mobile PageSpeed', value: '98/100' },
      { label: 'Bounce Rate Decrease', value: '-42%' }
    ],
    techStack: ['JavaScript (ES6+)', 'WordPress REST / AJAX', 'PHP WP_Query', 'Transients Cache', 'CSS Grid'],
    codeSnippet: `// Ultra-Fast AJAX Portfolio Fetcher with Transients
add_action('wp_ajax_nopriv_filter_portfolio', 'vdev_filter_portfolio');
add_action('wp_ajax_filter_portfolio', 'vdev_filter_portfolio');

function vdev_filter_portfolio() {
    check_ajax_referer('vdev_portfolio_nonce', 'security');
    $category = sanitize_text_field($_POST['category'] ?? 'all');
    $page = absint($_POST['page'] ?? 1);
    $cache_key = "vdev_port_{$category}_p{$page}";
    
    $cached_output = get_transient($cache_key);
    if (false !== $cached_output) {
        wp_send_json_success($cached_output);
    }
    
    $query_args = [
        'post_type'      => 'portfolio_item',
        'posts_per_page' => 9,
        'paged'          => $page,
        'no_found_rows'  => false,
    ];
    if ($category !== 'all') {
        $query_args['tax_query'] = [[
            'taxonomy' => 'portfolio_cat',
            'field'    => 'slug',
            'terms'    => $category
        ]];
    }
    
    $query = new WP_Query($query_args);
    // Render and cache output for 12 hours...
    set_transient($cache_key, $payload, 12 * HOUR_IN_SECONDS);
    wp_send_json_success($payload);
}`
  },
  {
    id: 'momwgn',
    number: 'CASE STUDY 03',
    title: 'MomWgn Ride OS',
    tagline: 'Custom Ride-Management Dispatch Dashboard + Stripe Elements',
    category: 'SAAS & CUSTOM DASHBOARD',
    image: '/assets/project-momwgn.svg',
    synopsis: 'Built an end-to-end custom ride-dispatch portal featuring Stripe Elements 3D Secure checkout, driver queue management, automated fare calculation, and telemetry logging.',
    problem: 'A premium suburban transport service needed a centralized, secure ride booking and driver dispatch system that worked directly inside WordPress without paying huge monthly SaaS vendor fees.',
    solution: 'Engineered a bespoke React-powered WordPress administration dashboard. Integrated Stripe Elements API with custom webhook event listeners, real-time ride state machines (Pending → Assigned → In Transit → Completed), and encrypted billing logs.',
    metrics: [
      { label: 'Monthly Rides Handled', value: '1,200+' },
      { label: 'Payment Failures', value: '0.00%' },
      { label: 'Dispatch Workflow Speed', value: '3x Faster' },
      { label: 'Annual SaaS Cost Saved', value: '$14,000+' }
    ],
    techStack: ['Stripe Elements API', 'React.js', 'PHP Custom Post Types', 'MySQL Telemetry', 'REST Webhooks'],
    codeSnippet: `// Stripe Elements Payment Intent & 3DS Verification
public function create_ride_payment_intent($ride_id, $amount, $currency = 'USD') {
    \Stripe\Stripe::setApiKey(VDEV_STRIPE_SECRET_KEY);
    
    $intent = \Stripe\PaymentIntent::create([
        'amount'   => intval($amount * 100),
        'currency' => $currency,
        'metadata' => [
            'ride_id'      => $ride_id,
            'passenger_id' => get_current_user_id(),
            'platform'     => 'MomWgn Dispatch'
        ],
        'automatic_payment_methods' => ['enabled' => true],
    ]);
    
    update_post_meta($ride_id, '_stripe_intent_id', $intent->id);
    return ['clientSecret' => $intent->client_secret];
}`
  },
  {
    id: 'aastral-insights',
    number: 'CASE STUDY 04',
    title: 'Aastral Insights',
    tagline: 'Customized LMS Architecture & JSON-Based Vedic Ephemeris Engine',
    category: 'EDTECH & ALGORITHMIC ENGINE',
    image: '/assets/project-aastral.svg',
    synopsis: 'Developed tailored course LMS features paired with a high-precision JSON-based Vedic astrology calculation engine generating customized reports in seconds.',
    problem: 'Standard LMS plugins could not support the specialized pedagogical requirements of Vedic astrological training, which requires calculating complex planetary coordinates and generating customized PDF natal charts for students.',
    solution: 'Constructed custom LMS extensions for student progression tracking alongside an algorithmic PHP + JavaScript calculations engine. Computes planetary degrees, ascendant houses, and dasha cycles, outputting instant downloadable PDFs.',
    metrics: [
      { label: 'Monthly Reports Generated', value: '5,000+' },
      { label: 'Calculation Engine Latency', value: '< 45ms' },
      { label: 'Student Course Completion', value: '91%' },
      { label: 'LMS Satisfaction Score', value: '4.95 / 5' }
    ],
    techStack: ['Custom LMS Hooks', 'JSON Ephemeris Engine', 'PHP 8.2', 'JavaScript Canvas', 'Dynamic PDF Engine'],
    codeSnippet: `// High-Speed Vedic Ephemeris JSON Calculation Bridge
public function compute_natal_chart_json($birth_epoch, $lat, $lng) {
    $planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
    $chart_data = [];
    
    $sidereal_time = $this->calculate_local_sidereal_time($birth_epoch, $lng);
    $ascendant_degree = $this->calculate_ascendant($sidereal_time, $lat);
    
    foreach ($planets as $planet) {
        $deg = $this->get_planetary_longitude($planet, $birth_epoch);
        $house = floor((($deg - $ascendant_degree + 360) % 360) / 30) + 1;
        $chart_data[$planet] = [
            'longitude' => round($deg, 4),
            'house'     => $house,
            'nakshatra' => $this->get_nakshatra_pada($deg),
            'dignity'   => $this->get_planetary_dignity($planet, $deg)
        ];
    }
    return json_encode(['ascendant' => $ascendant_degree, 'planets' => $chart_data]);
}`
  }
];
