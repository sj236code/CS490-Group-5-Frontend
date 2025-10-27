function ContactPage() {
    return (
        <div style={{ 
            padding: '3rem 2rem', 
            maxWidth: '800px', 
            margin: '0 auto' 
        }}>
            <h1 style={{ 
                color: '#4B5945', 
                marginBottom: '1rem' 
            }}>
                Contact Us
            </h1>
            <p style={{ 
                fontSize: '1.1rem', 
                lineHeight: '1.6', 
                color: '#333' 
            }}>
                Have questions or need assistance? We'd love to hear from you!
            </p>
            <div style={{ marginTop: '2rem' }}>
                <p><strong>Email:</strong> support@salon.com</p>
                <p><strong>Phone:</strong> (555) 123-4567</p>
                <p><strong>Hours:</strong> Mon-Fri, 9AM-5PM EST</p>
            </div>
        </div>
    );
}

export default ContactPage;