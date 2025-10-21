function ServiceCard({ icon: Icon, title, onClick }) {
    return (
        <div onClick={onClick} className="service-card">
            <Icon className="service-icon" strokeWidth={2} />
            <h3>{title}</h3>
        </div>
    );
}

export default ServiceCard