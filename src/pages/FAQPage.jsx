function FAQPage() {
    return (
        <div style={{ 
            padding: '3rem 2rem', 
            maxWidth: '800px', 
            margin: '0 auto' 
        }}>
            <h1 style={{ 
                color: '#4B5945', 
                marginBottom: '2rem' 
            }}>
                Frequently Asked Questions
            </h1>
            
            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: '#4B5945' }}>How do I book an appointment?</h3>
                <p style={{ lineHeight: '1.6' }}>
                    Search for salons in your area and select a service to book.
                </p>
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: '#4B5945' }}>Can I cancel my appointment?</h3>
                <p style={{ lineHeight: '1.6' }}>
                    Yes, you can cancel up to 24 hours before your appointment.
                </p>
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: '#4B5945' }}>How do I become a verified salon?</h3>
                <p style={{ lineHeight: '1.6' }}>
                    Contact our support team to start the verification process.
                </p>
            </div>
        </div>
    );
}

export default FAQPage;