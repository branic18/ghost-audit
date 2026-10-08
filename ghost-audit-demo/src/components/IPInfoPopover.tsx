import React, { useEffect, useId, useState } from 'react';
import { fetchIpData, type IpLookup } from '../api';

export default function IPInfoPopover() {
  const [open, setOpen] = useState(false);
  const [ip, setIp] = useState<IpLookup | null>(null);
  const [failed, setFailed] = useState(false);
  const id = useId();

  useEffect(() => {
    let cancelled = false;
    fetchIpData()
      .then((data) => {
        if (!cancelled) setIp(data);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const ipLabel = ip?.query || ip?.ip || (failed ? 'unavailable' : '…');
  const location = [ip?.Postal, ip?.City, ip?.RegionName, ip?.CountryName].filter(Boolean).join(', ');

  return (
    <span className="ip-pill-wrap" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        className="ip-pill"
        aria-expanded={open}
        aria-describedby={id}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
      >
        Your IP: {ipLabel}
      </button>
      {open && (
        <div role="tooltip" id={id} className="ip-info-popover">
          <p>
            This is your publicly known and active location to everyone within any browser or
            application.
          </p>
          {failed || !ip ? (
            <p>Unable to load IP details. Please try again later.</p>
          ) : (
            <>
              <p className="ip-info-popover__location">{location || 'Location unavailable'}</p>
              <p>Timezone: {ip.TimeZone || 'Unknown'}</p>
            </>
          )}
        </div>
      )}
    </span>
  );
}
