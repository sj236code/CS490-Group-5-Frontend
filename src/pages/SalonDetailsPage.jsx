import { useLocation } from 'react-router-dom';

function SalonDetailsPage() {
    const location = useLocation();
    const { salon } = location.state || {};
    
    return (
        <div style={{ padding: '50px', textAlign: 'center' }}>
            <h1>Salon Details Page</h1>
            
            {salon ? (
                <div>
                    <p style={{ fontSize: '24px', marginTop: '20px' }}>
                        Salon ID: <strong>{salon.id}</strong>
                    </p>
                    <p style={{ fontSize: '24px' }}>
                        Salon Name: <strong>{salon.title}</strong>
                    </p>
                </div>
            ) : (
                <p style={{ color: 'red' }}>No salon data found</p>
            )}
        </div>
    );
}

export default SalonDetailsPage;