-- ============================================================
-- Demo Trade Import for chartistmr@gmail.com
-- Source: 3 Telegram channel docs (Nov 2024, Dec 2024, Jan 2025)
-- Run this in Supabase SQL Editor
-- ============================================================

DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get user ID from email
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'chartistmr@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User chartistmr@gmail.com not found!';
  END IF;

  RAISE NOTICE 'Importing trades for user: %', v_user_id;

  -- ──────────────────────────────────────────────
  -- NOVEMBER 2024 TRADES (Doc 1)
  -- ──────────────────────────────────────────────

  -- 1. NIFTY 25550CE (Nov 10) - WIN
  INSERT INTO public.trades (user_id, symbol, segment, trade_type, quantity, entry_price, stop_loss, targets, status, entry_time, closed_at, pnl, pnl_percent, closure_reason, notes, rating)
  VALUES (v_user_id, 'NIFTY', 'Options', 'BUY', 1, 100, 60, '[130, 150, 175]'::jsonb, 'CLOSED', '2024-11-10 09:38:00+05:30', '2024-11-10 11:34:00+05:30', 4200, 42, 'TARGET_HIT', 'NIFTY 25550CE | T1 done at 142. Trail SL at cost.', 8);

  -- 2. PERSISTENT 6000CE (Nov 11) - WIN
  INSERT INTO public.trades (user_id, symbol, segment, trade_type, quantity, entry_price, stop_loss, targets, status, entry_time, closed_at, pnl, pnl_percent, closure_reason, notes, rating)
  VALUES (v_user_id, 'PERSISTENT', 'Options', 'BUY', 1, 141, 100, '[175, 195]'::jsonb, 'CLOSED', '2024-11-11 09:57:00+05:30', '2024-11-12 12:48:00+05:30', 9400, 66.7, 'TARGET_HIT', 'PERSISTENT 6000CE | Entry 141, hit 235. Spot 5980→6163.', 9);

  -- 3. INDUSINDBK 820CE (Nov 11) - WIN
  INSERT INTO public.trades (user_id, symbol, segment, trade_type, quantity, entry_price, stop_loss, targets, status, entry_time, closed_at, pnl, pnl_percent, closure_reason, notes, rating)
  VALUES (v_user_id, 'INDUSINDBK', 'Options', 'BUY', 1, 24.75, 17.75, '[29, 35, 40]'::jsonb, 'CLOSED', '2024-11-11 11:14:00+05:30', '2024-11-12 09:34:00+05:30', 3680, 148.7, 'TARGET_HIT', 'INDUSINDBK 820CE | 25→61.55. All targets done. Spot 825→872.', 9);

  -- 4. BHARATFORG 1360CE (Nov 11) - LOSS (SL hit due to results)
  INSERT INTO public.trades (user_id, symbol, segment, trade_type, quantity, entry_price, stop_loss, targets, status, entry_time, closed_at, pnl, pnl_percent, closure_reason, notes, rating)
  VALUES (v_user_id, 'BHARATFORG', 'Options', 'BUY', 1, 45, 30, '[60, 70, 80]'::jsonb, 'CLOSED', '2024-11-11 13:19:00+05:30', '2024-11-11 13:32:00+05:30', -1500, -33.3, 'SL_HIT', 'BHARATFORG 1360CE | SL hit due to result-based movement. Exit.', 8);

  -- 5. BIOCON 400CE (Nov 12) - WIN
  INSERT INTO public.trades (user_id, symbol, segment, trade_type, quantity, entry_price, stop_loss, targets, status, entry_time, closed_at, pnl, pnl_percent, closure_reason, notes, rating)
  VALUES (v_user_id, 'BIOCON', 'Options', 'BUY', 1, 11.5, 6, '[18, 25]'::jsonb, 'CLOSED', '2024-11-12 14:06:00+05:30', '2024-11-13 10:58:00+05:30', 1450, 126, 'TARGET_HIT', 'BIOCON 400CE | 11-12→26 Boom. Spot 400→422.', 8);

  -- 6. SONACOMS 500CE (Nov 19) - WIN
  INSERT INTO public.trades (user_id, symbol, segment, trade_type, quantity, entry_price, stop_loss, targets, status, entry_time, closed_at, pnl, pnl_percent, closure_reason, notes, rating)
  VALUES (v_user_id, 'SONACOMS', 'Options', 'BUY', 1, 10, 5, '[15, 18, 22]'::jsonb, 'CLOSED', '2024-11-19 11:07:00+05:30', '2024-11-20 12:31:00+05:30', 700, 70, 'TARGET_HIT', 'SONACOMS 500CE | 10→17. On fire 🔥', 8);

  -- 7. CHOLAFIN DEC 1700CE (Nov 20) - WIN
  INSERT INTO public.trades (user_id, symbol, segment, trade_type, quantity, entry_price, stop_loss, targets, status, entry_time, closed_at, pnl, pnl_percent, closure_reason, notes, rating)
  VALUES (v_user_id, 'CHOLAFIN', 'Options', 'BUY', 1, 37, 27, '[50, 60, 75]'::jsonb, 'CLOSED', '2024-11-20 12:35:00+05:30', '2024-11-26 09:49:00+05:30', 1700, 45.9, 'TARGET_HIT', 'CHOLAFIN DEC 1700CE | First target 54 done. Trail SL above cost.', 8);

  -- 8. EICHERMOT 7000CE DEC (Nov 20) - WIN
  INSERT INTO public.trades (user_id, symbol, segment, trade_type, quantity, entry_price, stop_loss, targets, status, entry_time, closed_at, pnl, pnl_percent, closure_reason, notes, rating)
  VALUES (v_user_id, 'EICHERMOT', 'Options', 'BUY', 1, 262, 175, '[375, 475, 575]'::jsonb, 'CLOSED', '2024-11-20 13:02:00+05:30', '2024-11-24 10:44:00+05:30', 11300, 43.1, 'TARGET_HIT', 'EICHERMOT 7000CE | 250-275→375 T1 done ✅', 9);

  -- 9. NIFTY 26050CE DEC (Nov 24) - LOSS
  INSERT INTO public.trades (user_id, symbol, segment, trade_type, quantity, entry_price, stop_loss, targets, status, entry_time, closed_at, pnl, pnl_percent, closure_reason, notes, rating)
  VALUES (v_user_id, 'NIFTY', 'Options', 'BUY', 1, 267, 200, '[325, 375, 410]'::jsonb, 'CLOSED', '2024-11-24 12:51:00+05:30', '2024-11-24 15:09:00+05:30', -6700, -25.1, 'SL_HIT', 'NIFTY 26050CE | Failed to push above 26000. SL hit.', 7);

  -- 10. VBL DEC 445CE (Nov 25) - WIN (all targets)
  INSERT INTO public.trades (user_id, symbol, segment, trade_type, quantity, entry_price, stop_loss, targets, status, entry_time, closed_at, pnl, pnl_percent, closure_reason, notes, rating)
  VALUES (v_user_id, 'VBL', 'Options', 'BUY', 1, 15.5, 9, '[19, 23, 27]'::jsonb, 'CLOSED', '2024-11-25 15:16:00+05:30', '2024-11-26 11:45:00+05:30', 1360, 87.7, 'TARGET_HIT', 'VBL 445CE | 14→29 done. All targets done ~80%+ gain!', 8);

  -- 11. BHEL 300CE (Nov 26) - WIN
  INSERT INTO public.trades (user_id, symbol, segment, trade_type, quantity, entry_price, stop_loss, targets, status, entry_time, closed_at, pnl, pnl_percent, closure_reason, notes, rating)
  VALUES (v_user_id, 'BHEL', 'Options', 'BUY', 1, 5.9, 2.6, '[8, 10, 12]'::jsonb, 'CLOSED', '2024-11-26 11:00:00+05:30', '2024-11-27 10:15:00+05:30', 210, 35.6, 'TARGET_HIT', 'BHEL 300CE | 5→8 T1 done. Trail SL near 4.', 8);

  -- 12. GLENMARK 1900CE (Nov 26) - WIN
  INSERT INTO public.trades (user_id, symbol, segment, trade_type, quantity, entry_price, stop_loss, targets, status, entry_time, closed_at, pnl, pnl_percent, closure_reason, notes, rating)
  VALUES (v_user_id, 'GLENMARK', 'Options', 'BUY', 1, 75, 50, '[100, 125, 150]'::jsonb, 'CLOSED', '2024-11-26 12:33:00+05:30', '2024-11-27 09:45:00+05:30', 2500, 33.3, 'TARGET_HIT', 'GLENMARK 1900CE | 75→100 T1 done ✅', 8);

  -- 13. SRF 2900CE (Nov 27) - WIN
  INSERT INTO public.trades (user_id, symbol, segment, trade_type, quantity, entry_price, stop_loss, targets, status, entry_time, closed_at, pnl, pnl_percent, closure_reason, notes, rating)
  VALUES (v_user_id, 'SRF', 'Options', 'BUY', 1, 56, 30, '[85, 95, 105]'::jsonb, 'CLOSED', '2024-11-27 10:33:00+05:30', '2024-11-28 11:57:00+05:30', 3600, 64.3, 'TARGET_HIT', 'SRF 2900CE | First target done. 2X done eventually.', 8);

  -- 14. MOTHERSON spot (Nov 27) - WIN
  INSERT INTO public.trades (user_id, symbol, segment, trade_type, quantity, entry_price, stop_loss, targets, status, entry_time, closed_at, pnl, pnl_percent, closure_reason, notes, rating)
  VALUES (v_user_id, 'MOTHERSON', 'Equity_Positional', 'BUY', 100, 113, 108, '[120, 130, 140]'::jsonb, 'CLOSED', '2024-11-27 10:00:00+05:30', '2024-12-01 11:28:00+05:30', 800, 7.1, 'TARGET_HIT', 'MOTHERSON Positional | Spot 113→121 done. 115CE 3.5→7.43.', 8);

  -- ──────────────────────────────────────────────
  -- DECEMBER 2024 TRADES (Doc 2)
  -- ──────────────────────────────────────────────

  -- 15. PERSISTENT 6500CE Dec 4 - WIN
  INSERT INTO public.trades (user_id, symbol, segment, trade_type, quantity, entry_price, stop_loss, targets, status, entry_time, closed_at, pnl, pnl_percent, closure_reason, notes, rating)
  VALUES (v_user_id, 'PERSISTENT', 'Options', 'BUY', 1, 165, 120, '[196, 215, 235]'::jsonb, 'CLOSED', '2024-12-04 09:22:00+05:30', '2024-12-04 12:31:00+05:30', 3500, 21.2, 'TARGET_HIT', 'PERSISTENT 6500CE | 160-170→200 T1 done. Setup 8.25, safe above 6480.', 8);

  -- 16. INDUSTOWER 410CE Dec 5 - LOSS (SL hit)
  INSERT INTO public.trades (user_id, symbol, segment, trade_type, quantity, entry_price, stop_loss, targets, status, entry_time, closed_at, pnl, pnl_percent, closure_reason, notes, rating)
  VALUES (v_user_id, 'INDUSTOWER', 'Options', 'BUY', 1, 14.5, 9.25, '[20, 24, 28]'::jsonb, 'CLOSED', '2024-12-05 12:37:00+05:30', '2024-12-08 12:34:00+05:30', -350, -24.1, 'SL_HIT', 'INDUSTOWER 410CE | SL hit at 11. Trail SL was 11 (CB).', 8);

  -- 17. MFSL 1700CE Dec 5 - open/trailing
  INSERT INTO public.trades (user_id, symbol, segment, trade_type, quantity, entry_price, stop_loss, targets, status, entry_time, notes, rating)
  VALUES (v_user_id, 'MFSL', 'Options', 'BUY', 1, 37, 24, '[55, 65, 75]'::jsonb, 'CLOSED', '2024-12-05 13:05:00+05:30', 'MFSL 1700CE | Risky trade. TSL at 30 after hitting 47 high. Setup 8.', 8);

  -- 18. PB FINTECH 1900CE Dec 9 - WIN (trail SL hit near cost)
  INSERT INTO public.trades (user_id, symbol, segment, trade_type, quantity, entry_price, stop_loss, targets, status, entry_time, closed_at, pnl, pnl_percent, closure_reason, notes, rating)
  VALUES (v_user_id, 'POLICYBZR', 'Options', 'BUY', 1, 74, 45, '[95, 105, 115, 125]'::jsonb, 'CLOSED', '2024-12-09 12:10:00+05:30', '2024-12-10 11:04:00+05:30', 1400, 18.9, 'TARGET_HIT', 'PB FINTECH 1900CE | 78→92 T1+. Trail SL hit near cost on Dec 10.', 8);

  -- 19. EICHERMOT 7300CE Dec 10 - WIN
  INSERT INTO public.trades (user_id, symbol, segment, trade_type, quantity, entry_price, stop_loss, targets, status, entry_time, closed_at, pnl, pnl_percent, closure_reason, notes, rating)
  VALUES (v_user_id, 'EICHERMOT', 'Options', 'BUY', 1, 118, 80, '[145, 165, 185]'::jsonb, 'CLOSED', '2024-12-10 10:01:00+05:30', '2024-12-11 09:24:00+05:30', 3900, 33, 'TARGET_HIT', 'EICHERMOT 7300CE | 115-125→157 done. Setup 8.75. Spot 7240→7333.', 9);

  -- 20. ADANIENT 2300CE Dec 11 - LOSS (SL hit Dec 16)
  INSERT INTO public.trades (user_id, symbol, segment, trade_type, quantity, entry_price, stop_loss, targets, status, entry_time, closed_at, pnl, pnl_percent, closure_reason, notes, rating)
  VALUES (v_user_id, 'ADANIENT', 'Options', 'BUY', 1, 53, 35, '[80, 90, 100]'::jsonb, 'CLOSED', '2024-12-11 13:50:00+05:30', '2024-12-16 09:32:00+05:30', -1800, -34, 'SL_HIT', 'ADANIENT 2300CE | SL hit at 35. Setup 8.5.', 9);

  -- 21. ASHOKLEY 165CE - WIN (all targets)
  INSERT INTO public.trades (user_id, symbol, segment, trade_type, quantity, entry_price, stop_loss, targets, status, entry_time, closed_at, pnl, pnl_percent, closure_reason, notes, rating)
  VALUES (v_user_id, 'ASHOKLEY', 'Options', 'BUY', 1, 2.66, 1.60, '[3.5, 4.5, 5.5]'::jsonb, 'CLOSED', '2024-12-11 09:39:00+05:30', '2024-12-22 09:00:00+05:30', 577, 217, 'TARGET_HIT', 'ASHOKLEY 165CE | 2.5→8.42 🔥 All targets done. Spot 163→174. Setup 8.75.', 9);

  -- 22. IDFCFIRSTB 85CE - WIN
  INSERT INTO public.trades (user_id, symbol, segment, trade_type, quantity, entry_price, stop_loss, targets, status, entry_time, closed_at, pnl, pnl_percent, closure_reason, notes, rating)
  VALUES (v_user_id, 'IDFCFIRSTB', 'Options', 'BUY', 1, 0.77, 0.30, '[1.2, 1.6, 2.0]'::jsonb, 'CLOSED', '2024-12-11 14:05:00+05:30', '2024-12-15 14:03:00+05:30', 69, 89.6, 'TARGET_HIT', 'IDFCFIRSTB 85CE | 0.77→1.46 almost 2X done. Setup 8.75.', 9);

  -- 23. BLUESTARCO 1900CE Dec 15 - WIN
  INSERT INTO public.trades (user_id, symbol, segment, trade_type, quantity, entry_price, stop_loss, targets, status, entry_time, closed_at, pnl, pnl_percent, closure_reason, notes, rating)
  VALUES (v_user_id, 'BLUESTARCO', 'Options', 'BUY', 1, 6.2, 1, '[10, 12, 14, 18, 25]'::jsonb, 'CLOSED', '2024-12-15 09:26:00+05:30', '2024-12-18 11:56:00+05:30', 588, 94.8, 'TARGET_HIT', 'BLUESTARCO 1900CE | 5→12 🔥 Hero Zero type.', 9);

  -- 24. PHOENIXLTD 1800CE Dec 15 - WIN (positional)
  INSERT INTO public.trades (user_id, symbol, segment, trade_type, quantity, entry_price, stop_loss, targets, status, entry_time, closed_at, pnl, pnl_percent, closure_reason, notes, rating)
  VALUES (v_user_id, 'PHOENIXLTD', 'Options', 'BUY', 1, 28, 12, '[48, 60, 80]'::jsonb, 'CLOSED', '2024-12-15 14:15:00+05:30', '2024-12-21 00:00:00+05:30', 2000, 71.4, 'TARGET_HIT', 'PHOENIXLTD 1800CE Positional | 25-31→48 T1 done ✅. Then 40 done. Setup 8.75.', 9);

  -- 25. VOLTAS 1400CE JAN Dec 16 - WIN (positional)
  INSERT INTO public.trades (user_id, symbol, segment, trade_type, quantity, entry_price, stop_loss, targets, status, entry_time, closed_at, pnl, pnl_percent, closure_reason, notes, rating)
  VALUES (v_user_id, 'VOLTAS', 'Options', 'BUY', 1, 35, 15, '[60, 80, 100, 120]'::jsonb, 'CLOSED', '2024-12-16 12:51:00+05:30', '2024-12-18 11:42:00+05:30', 1100, 31.4, 'TARGET_HIT', 'VOLTAS 1400CE JAN Positional | 30-40→46 T1 done. Setup 8.75.', 9);

  -- 26. LUPIN 2140CE Dec 19 - LOSS (SL hit Dec 22)
  INSERT INTO public.trades (user_id, symbol, segment, trade_type, quantity, entry_price, stop_loss, targets, status, entry_time, closed_at, pnl, pnl_percent, closure_reason, notes, rating)
  VALUES (v_user_id, 'LUPIN', 'Options', 'BUY', 1, 25, 16, '[32, 38, 48]'::jsonb, 'CLOSED', '2024-12-19 00:00:00+05:30', '2024-12-22 00:00:00+05:30', -900, -36, 'SL_HIT', 'LUPIN 2140CE | SL hit at 16. Exit and book loss. Setup 8.75.', 9);

  -- 27. KEI 4200CE - WIN (425% done!)
  INSERT INTO public.trades (user_id, symbol, segment, trade_type, quantity, entry_price, stop_loss, targets, status, entry_time, closed_at, pnl, pnl_percent, closure_reason, notes, rating)
  VALUES (v_user_id, 'KEI', 'Options', 'BUY', 1, 76, 45, '[89, 98, 108]'::jsonb, 'CLOSED', '2024-12-19 00:00:00+05:30', '2024-12-22 00:00:00+05:30', 22724, 299, 'TARGET_HIT', 'KEI 4200CE | 76→303 done! 4.25X done. 425% gain. Perfect movement and perfect catch 🎯', 9);

  -- 28. MANAPPURAM 300CE Dec 19 - WIN
  INSERT INTO public.trades (user_id, symbol, segment, trade_type, quantity, entry_price, stop_loss, targets, status, entry_time, closed_at, pnl, pnl_percent, closure_reason, notes, rating)
  VALUES (v_user_id, 'MANAPPURAM', 'Options', 'BUY', 1, 2.15, 0.5, '[4, 5, 6, 7]'::jsonb, 'CLOSED', '2024-12-19 00:00:00+05:30', '2024-12-24 00:00:00+05:30', 1185, 551, 'TARGET_HIT', 'MANAPPURAM 300CE | 2→14 CE 7X! Stock 7% up. 9X eventually. Hero Zero type. Setup 8.75.', 9);

  -- 29. BHARATFORG 1500CE JAN Dec 22 - OPEN/trailing
  INSERT INTO public.trades (user_id, symbol, segment, trade_type, quantity, entry_price, stop_loss, targets, status, entry_time, notes, rating)
  VALUES (v_user_id, 'BHARATFORG', 'Options', 'BUY', 1, 32, 20, '[40, 45, 50, 55]'::jsonb, 'OPEN', '2024-12-22 00:00:00+05:30', 'BHARATFORG 1500CE JAN | Positional. SL revised to Spot 1435. Setup 8.50.', 9);

  -- 30. NMDC JAN 80CE Dec 22 - WIN
  INSERT INTO public.trades (user_id, symbol, segment, trade_type, quantity, entry_price, stop_loss, targets, status, entry_time, closed_at, pnl, pnl_percent, closure_reason, notes, rating)
  VALUES (v_user_id, 'NMDC', 'Options', 'BUY', 1, 1.9, 0.8, '[3, 4, 5, 6]'::jsonb, 'CLOSED', '2024-12-22 00:00:00+05:30', '2024-12-30 09:29:00+05:30', 295, 155, 'TARGET_HIT', 'NMDC JAN 80CE | 1.90→4.85 done ✅. Both targets smoothly. Top gainer F&O. Setup 8.75.', 9);

  -- 31. CONCOR 510CE Dec 23 - WIN
  INSERT INTO public.trades (user_id, symbol, segment, trade_type, quantity, entry_price, stop_loss, targets, status, entry_time, closed_at, pnl, pnl_percent, closure_reason, notes, rating)
  VALUES (v_user_id, 'CONCOR', 'Options', 'BUY', 1, 5.95, 2, '[10, 12, 15]'::jsonb, 'CLOSED', '2024-12-23 00:00:00+05:30', '2024-12-26 00:00:00+05:30', 600, 100.8, 'TARGET_HIT', 'CONCOR 510CE | 5→12 done. Almost 2X ✅. Spot target 524 hit.', 8);

  -- 32. 360ONE 1200CE Dec 23 - WIN
  INSERT INTO public.trades (user_id, symbol, segment, trade_type, quantity, entry_price, stop_loss, targets, status, entry_time, closed_at, pnl, pnl_percent, closure_reason, notes, rating)
  VALUES (v_user_id, '360ONE', 'Options', 'BUY', 1, 8.2, 1, '[15, 20, 25]'::jsonb, 'CLOSED', '2024-12-23 00:00:00+05:30', '2024-12-24 00:00:00+05:30', 980, 119.5, 'TARGET_HIT', '360ONE 1200CE | 9-6→18++ done! 3X almost. Spot 1180-1185. Setup 8.75.', 9);

  -- 33. NUVAMA 7400CE JAN Dec 24 - LOSS (SL hit Dec 29)
  INSERT INTO public.trades (user_id, symbol, segment, trade_type, quantity, entry_price, stop_loss, targets, status, entry_time, closed_at, pnl, pnl_percent, closure_reason, notes, rating)
  VALUES (v_user_id, 'NUVAMA', 'Options', 'BUY', 1, 365, 250, '[450, 500, 600, 800]'::jsonb, 'CLOSED', '2024-12-24 00:00:00+05:30', '2024-12-29 00:00:00+05:30', -11500, -31.5, 'SL_HIT', 'NUVAMA 7400 JAN CE | T1 done 380→476. Then SL hit. Setup 8.75.', 9);

  -- 34. JSWSTEEL JAN 1100CE Dec 29 - WIN
  INSERT INTO public.trades (user_id, symbol, segment, trade_type, quantity, entry_price, stop_loss, targets, status, entry_time, closed_at, pnl, pnl_percent, closure_reason, notes, rating)
  VALUES (v_user_id, 'JSWSTEEL', 'Options', 'BUY', 1, 37, 25, '[48, 56, 76]'::jsonb, 'CLOSED', '2024-12-29 00:00:00+05:30', '2024-12-31 09:16:00+05:30', 2600, 70.3, 'TARGET_HIT', 'JSWSTEEL JAN 1100CE | 37→63 done. Two targets done. Top gainer 4% up in pre-open.', 8);

  -- 35. AXISBANK 1240CE Dec 30 - WIN
  INSERT INTO public.trades (user_id, symbol, segment, trade_type, quantity, entry_price, stop_loss, targets, status, entry_time, closed_at, pnl, pnl_percent, closure_reason, notes, rating)
  VALUES (v_user_id, 'AXISBANK', 'Options', 'BUY', 1, 29, 20, '[40, 50]'::jsonb, 'CLOSED', '2024-12-30 10:23:00+05:30', '2024-12-31 15:13:00+05:30', 1700, 58.6, 'TARGET_HIT', 'AXISBANK 1240CE | 29→46 target done ✅. Setup 8.25.', 8);

  -- ──────────────────────────────────────────────
  -- JANUARY 2025 TRADES (Doc 3)
  -- ──────────────────────────────────────────────

  -- 36. INDUSINDBK 900CE JAN 1 - WIN (2X)
  INSERT INTO public.trades (user_id, symbol, segment, trade_type, quantity, entry_price, stop_loss, targets, status, entry_time, closed_at, pnl, pnl_percent, closure_reason, notes, rating)
  VALUES (v_user_id, 'INDUSINDBK', 'Options', 'BUY', 1, 19.8, 12, '[27, 35, 45]'::jsonb, 'CLOSED', '2025-01-01 00:00:00+05:30', '2025-01-06 00:00:00+05:30', 2020, 102, 'TARGET_HIT', 'INDUSINDBK 900CE | 18-20→40 done. 2X! Moving towards final target. Setup 8.75.', 9);

  -- 37. TORNTPOWER 1400CE JAN 2 - WIN (big move)
  INSERT INTO public.trades (user_id, symbol, segment, trade_type, quantity, entry_price, stop_loss, targets, status, entry_time, closed_at, pnl, pnl_percent, closure_reason, notes, rating)
  VALUES (v_user_id, 'TORNTPOWER', 'Options', 'BUY', 1, 16.5, 9, '[22, 28, 38]'::jsonb, 'CLOSED', '2025-01-02 00:00:00+05:30', '2025-01-02 00:00:00+05:30', 2140, 129.7, 'TARGET_HIT', 'TORNTPOWER 1400CE | 16.5→37.90 🔥 Spot 1350→1396. Setup 8.5.', 9);

  -- 38. PETRONET 300CE JAN 27 (Jan 2) - WIN (2.5X)
  INSERT INTO public.trades (user_id, symbol, segment, trade_type, quantity, entry_price, stop_loss, targets, status, entry_time, closed_at, pnl, pnl_percent, closure_reason, notes, rating)
  VALUES (v_user_id, 'PETRONET', 'Options', 'BUY', 1, 2.4, 1, '[3.5, 5, 7]'::jsonb, 'CLOSED', '2025-01-02 00:00:00+05:30', '2025-01-07 00:00:00+05:30', 360, 150, 'TARGET_HIT', 'PETRONET 27JAN 300CE | 2.2-2.5→6 done ~2.5X. Book and close. Setup 8.75.', 9);

  -- 39. MFSL 1800CE JAN 6 - partial win
  INSERT INTO public.trades (user_id, symbol, segment, trade_type, quantity, entry_price, stop_loss, targets, status, entry_time, notes, rating)
  VALUES (v_user_id, 'MFSL', 'Options', 'BUY', 1, 18, 7, '[26, 30, 35, 40]'::jsonb, 'CLOSED', '2025-01-06 00:00:00+05:30', 'MFSL 1800CE | 17-19→25.15. Trading at cost. Setup 8.75.', 9);

  -- 40. ICICIBANK 1400CE JAN 6 - WIN (2X)
  INSERT INTO public.trades (user_id, symbol, segment, trade_type, quantity, entry_price, stop_loss, targets, status, entry_time, closed_at, pnl, pnl_percent, closure_reason, notes, rating)
  VALUES (v_user_id, 'ICICIBANK', 'Options', 'BUY', 1, 27.5, 17, '[40, 50]'::jsonb, 'CLOSED', '2025-01-06 00:00:00+05:30', '2025-01-08 00:00:00+05:30', 2750, 100, 'TARGET_HIT', 'ICICIBANK 1400CE | 27-28→55 done. 2X! 9-month descending channel breakout. Setup 8.5.', 9);

  -- 41. TORNTPHARM 4000CE JAN 6 - WIN
  INSERT INTO public.trades (user_id, symbol, segment, trade_type, quantity, entry_price, stop_loss, targets, status, entry_time, closed_at, pnl, pnl_percent, closure_reason, notes, rating)
  VALUES (v_user_id, 'TORNTPHARM', 'Options', 'BUY', 1, 34, 20, '[50, 60, 70]'::jsonb, 'CLOSED', '2025-01-06 00:00:00+05:30', '2025-01-07 00:00:00+05:30', 7100, 208.8, 'TARGET_HIT', 'TORNTPHARM 4000CE | 30-38→105 done. Spot 3900→4060. Near final target. Setup 8.75.', 9);

  -- 42. SYNGENE 700CE JAN 7 - WIN
  INSERT INTO public.trades (user_id, symbol, segment, trade_type, quantity, entry_price, stop_loss, targets, status, entry_time, closed_at, pnl, pnl_percent, closure_reason, notes, rating)
  VALUES (v_user_id, 'SYNGENE', 'Options', 'BUY', 1, 7.5, 3, '[11, 14, 17]'::jsonb, 'CLOSED', '2025-01-07 00:00:00+05:30', '2025-01-07 00:00:00+05:30', 250, 33.3, 'TARGET_HIT', 'SYNGENE 700CE | 7-8→11 T1 done. Setup 8.5.', 9);

  -- 43. VOLTAS 1400CE JAN (Jan 23) - WIN
  INSERT INTO public.trades (user_id, symbol, segment, trade_type, quantity, entry_price, stop_loss, targets, status, entry_time, closed_at, pnl, pnl_percent, closure_reason, notes, rating)
  VALUES (v_user_id, 'VOLTAS', 'Options', 'BUY', 1, 31, 20, '[45, 55, 65]'::jsonb, 'CLOSED', '2025-01-23 00:00:00+05:30', '2025-01-28 00:00:00+05:30', 1400, 45.2, 'TARGET_HIT', 'VOLTAS 1400CE FEB | 30→45 T1 done. Setup 8.25.', 8);

  -- 44. BEL 420CE FEB (Jan 16) - WIN (3X!)
  INSERT INTO public.trades (user_id, symbol, segment, trade_type, quantity, entry_price, stop_loss, targets, status, entry_time, closed_at, pnl, pnl_percent, closure_reason, notes, rating)
  VALUES (v_user_id, 'BEL', 'Options', 'BUY', 1, 14, 8, '[25, 35]'::jsonb, 'CLOSED', '2025-01-16 00:00:00+05:30', '2025-01-28 00:00:00+05:30', 2800, 200, 'TARGET_HIT', 'BEL 420CE FEB Positional | 12-16→42 done. 3X! BEL 10% UC. Spot 405-415→450. Setup 8.75.', 9);

  -- 45. MARUTI 16000CE (Jan 16) - WIN (near final target)
  INSERT INTO public.trades (user_id, symbol, segment, trade_type, quantity, entry_price, stop_loss, targets, status, entry_time, closed_at, pnl, pnl_percent, closure_reason, notes, rating)
  VALUES (v_user_id, 'MARUTI', 'Options', 'BUY', 1, 174, 135, '[200, 220, 240]'::jsonb, 'CLOSED', '2025-01-16 00:00:00+05:30', '2025-01-16 00:00:00+05:30', 6100, 35.1, 'TARGET_HIT', 'MARUTI 16000CE Intraday | 170-180→235 near final. All targets done. Setup 8.5.', 9);

  -- 46. BANKINDIA 155CE (Jan 16) - WIN (150%+)
  INSERT INTO public.trades (user_id, symbol, segment, trade_type, quantity, entry_price, stop_loss, targets, status, entry_time, closed_at, pnl, pnl_percent, closure_reason, notes, rating)
  VALUES (v_user_id, 'BANKINDIA', 'Options', 'BUY', 1, 4, 2.8, '[5, 6, 7]'::jsonb, 'CLOSED', '2025-01-16 00:00:00+05:30', '2025-01-19 00:00:00+05:30', 625, 156.3, 'TARGET_HIT', 'BANKINDIA 155CE | 4→10.25 done ✅ ~150%+ gain. Cup and Handle pattern. Setup 9.', 9);

  -- 47. COLPAL 2200CE (Jan 19) - WIN (Benchmark day - 4X!)
  INSERT INTO public.trades (user_id, symbol, segment, trade_type, quantity, entry_price, stop_loss, targets, status, entry_time, closed_at, pnl, pnl_percent, closure_reason, notes, rating)
  VALUES (v_user_id, 'COLPAL', 'Options', 'BUY', 1, 11, 2, '[20, 30]'::jsonb, 'CLOSED', '2025-01-19 00:00:00+05:30', '2025-01-19 00:00:00+05:30', 3900, 354.5, 'TARGET_HIT', 'COLPAL 2200CE | 12→50 done 🚀 4X in minutes! Benchmark day. Setup 8.5.', 9);

  -- 48. IIFL 650CE (Jan 19) - WIN
  INSERT INTO public.trades (user_id, symbol, segment, trade_type, quantity, entry_price, stop_loss, targets, status, entry_time, closed_at, pnl, pnl_percent, closure_reason, notes, rating)
  VALUES (v_user_id, 'IIFL', 'Options', 'BUY', 1, 12.25, 7.5, '[16, 20, 24]'::jsonb, 'CLOSED', '2025-01-19 00:00:00+05:30', '2025-01-19 00:00:00+05:30', 688, 56.2, 'TARGET_HIT', 'IIFL 650CE Scalping | 12→19 near T2. Setup 8.25.', 8);

  -- 49. GAIL 165CE (Jan 21) - WIN
  INSERT INTO public.trades (user_id, symbol, segment, trade_type, quantity, entry_price, stop_loss, targets, status, entry_time, closed_at, pnl, pnl_percent, closure_reason, notes, rating)
  VALUES (v_user_id, 'GAIL', 'Options', 'BUY', 1, 0.97, 0.2, '[2, 3]'::jsonb, 'CLOSED', '2025-01-21 00:00:00+05:30', '2025-01-21 00:00:00+05:30', 108, 111.3, 'TARGET_HIT', 'GAIL 165CE Hero-Zero | 0.97→2.05 T1 done! High risk scalp. Setup 8.', 8);

  -- 50. GODREJPROP 1600CE (Jan 29) - OPEN
  INSERT INTO public.trades (user_id, symbol, segment, trade_type, quantity, entry_price, stop_loss, targets, status, entry_time, notes, rating)
  VALUES (v_user_id, 'GODREJPROP', 'Options', 'BUY', 1, 70, 40, '[96, 120, 160]'::jsonb, 'OPEN', '2025-01-29 00:00:00+05:30', 'GODREJPROP 1600CE | Risky. LTP 57 holding with SL. Setup 8.25.', 8);

  -- 51. NTPC 350CE (Jan 29) - WIN
  INSERT INTO public.trades (user_id, symbol, segment, trade_type, quantity, entry_price, stop_loss, targets, status, entry_time, closed_at, pnl, pnl_percent, closure_reason, notes, rating)
  VALUES (v_user_id, 'NTPC', 'Options', 'BUY', 1, 12.35, 8, '[16, 18, 20]'::jsonb, 'CLOSED', '2025-01-29 00:00:00+05:30', '2025-01-29 00:00:00+05:30', 365, 29.6, 'TARGET_HIT', 'NTPC 350CE Intraday | 12.35→16 T1 done ✅. Setup 8.75.', 9);

  -- 52. INDIANB 950CE (Jan 29) - OPEN (TF 10 days)
  INSERT INTO public.trades (user_id, symbol, segment, trade_type, quantity, entry_price, stop_loss, targets, status, entry_time, notes, rating)
  VALUES (v_user_id, 'INDIANB', 'Options', 'BUY', 1, 18.5, 12, '[30, 40]'::jsonb, 'OPEN', '2025-01-29 00:00:00+05:30', 'INDIANB 950CE | TF 10 days. Full entry range done. Game on at 920 spot level. Setup 8.75.', 9);

  -- 53. JINDALSTEEL 1100CE FEB (Jan 23) - LOSS (Trail SL hit)
  INSERT INTO public.trades (user_id, symbol, segment, trade_type, quantity, entry_price, stop_loss, targets, status, entry_time, closed_at, pnl, pnl_percent, closure_reason, notes, rating)
  VALUES (v_user_id, 'JINDALSTEL', 'Options', 'BUY', 1, 41, 32, '[55, 65, 75]'::jsonb, 'CLOSED', '2025-01-23 00:00:00+05:30', '2025-01-28 00:00:00+05:30', -700, -17.1, 'SL_HIT', 'JINDALSTEEL 1100CE FEB Positional | TSL hit at 34. Setup 8.75.', 9);

  -- 54. MAZDOCK 2600CE (Jan 9) - WIN (2nd target done)
  INSERT INTO public.trades (user_id, symbol, segment, trade_type, quantity, entry_price, stop_loss, targets, status, entry_time, closed_at, pnl, pnl_percent, closure_reason, notes, rating)
  VALUES (v_user_id, 'MAZDOCK', 'Options', 'BUY', 1, 71, 55, '[85, 95, 105]'::jsonb, 'CLOSED', '2025-01-09 00:00:00+05:30', '2025-01-09 00:00:00+05:30', 2700, 38, 'TARGET_HIT', 'MAZDOCK 2600CE | 72→98 second target done ✅. TSL at 65. Setup 8.25.', 8);

  -- 55. DIVISLAB 6000PE (Jan 16) - WIN
  INSERT INTO public.trades (user_id, symbol, segment, trade_type, quantity, entry_price, stop_loss, targets, status, entry_time, closed_at, pnl, pnl_percent, closure_reason, notes, rating)
  VALUES (v_user_id, 'DIVISLAB', 'Options', 'SELL', 1, 24.8, 16, '[35, 40]'::jsonb, 'CLOSED', '2025-01-16 00:00:00+05:30', '2025-01-16 00:00:00+05:30', 1520, 61.3, 'TARGET_HIT', 'DIVISLAB 6000PUT | 25→40 both targets done ✅. Setup 8.5.', 9);

  -- 56. LTF 300CE (Jan 15) - WIN (2X)
  INSERT INTO public.trades (user_id, symbol, segment, trade_type, quantity, entry_price, stop_loss, targets, status, entry_time, closed_at, pnl, pnl_percent, closure_reason, notes, rating)
  VALUES (v_user_id, 'LTF', 'Options', 'BUY', 1, 4.6, 3.3, '[6, 8, 10]'::jsonb, 'CLOSED', '2025-01-15 00:00:00+05:30', '2025-01-16 00:00:00+05:30', 380, 82.6, 'TARGET_HIT', 'LTF 300CE | 4.5-4.8→8.40 done. Almost 2X ✅. Reversal risky trade. Setup 8.25.', 8);

  -- 57. COALINDIA 450CE (Jan 14) - WIN
  INSERT INTO public.trades (user_id, symbol, segment, trade_type, quantity, entry_price, stop_loss, targets, status, entry_time, closed_at, pnl, pnl_percent, closure_reason, notes, rating)
  VALUES (v_user_id, 'COALINDIA', 'Options', 'BUY', 1, 3.65, 1.8, '[5, 6, 7]'::jsonb, 'CLOSED', '2025-01-14 00:00:00+05:30', '2025-01-14 00:00:00+05:30', 135, 37, 'TARGET_HIT', 'COALINDIA 450CE | 3.5→5 T1 done. Risky trade.', 7);

  -- ──────────────────────────────────────────────
  -- ALERTS (8 watchlist alerts)
  -- ──────────────────────────────────────────────

  INSERT INTO public.alerts (user_id, symbol, condition_type, threshold, recurrence, active, parameters) VALUES
    (v_user_id, 'RELIANCE', 'PRICE_GT', 2650, 'ONCE', true, '{"note": "Breakout above resistance zone"}'::jsonb),
    (v_user_id, 'TATASTEEL', 'PRICE_LT', 140, 'ONCE', true, '{"note": "Support zone buy trigger"}'::jsonb),
    (v_user_id, 'HDFCBANK', 'PRICE_GT', 1850, 'ONCE', true, '{"note": "All-time high breakout watch"}'::jsonb),
    (v_user_id, 'INFY', 'PERCENT_CHANGE_GT', 3, 'DAILY', true, '{"note": "Big move alert for scalp"}'::jsonb),
    (v_user_id, 'NIFTY', 'PRICE_GT', 26500, 'ONCE', true, '{"note": "Nifty breakout above 26500 — bullish momentum"}'::jsonb),
    (v_user_id, 'COALINDIA', 'PRICE_GT', 430, 'ONCE', true, '{"note": "Symmetrical triangle breakout target"}'::jsonb),
    (v_user_id, 'VOLTAS', 'PRICE_GT', 1550, 'ONCE', true, '{"note": "Next resistance after double bottom breakout"}'::jsonb),
    (v_user_id, 'BAJFINANCE', 'PRICE_LT', 7100, 'ONCE', true, '{"note": "Key support — reversal buy candidate"}'::jsonb);

  RAISE NOTICE '✅ 8 alerts inserted!';

  -- ──────────────────────────────────────────────
  -- STUDIES (8 technical analysis studies)
  -- ──────────────────────────────────────────────

  INSERT INTO public.studies (user_id, title, symbol, category, notes, tags, analysis_date) VALUES
    (v_user_id, 'ICICIBANK — 9 Month Descending Channel Breakout', 'ICICIBANK', 'Technical',
     'ICICI Bank spent 9 months inside a descending channel. Price rising with expanding volume. Breakout above 1420 opens door for 1450→1480→1520. Support: 1380. Multi-month correction preparing for expansion.',
     ARRAY['Channel Breakout', 'Institutional Buying', 'Volume Expansion'], '2025-01-07'),

    (v_user_id, 'COALINDIA — Symmetrical Triangle Pattern', 'COALINDIA', 'Technical',
     'COALINDIA forming symmetrical triangle near 395.20 resistance. Breakout triggered massive move — 395→412 in spot, 400CE 4→14 (3.5X). Classic compression breakout. Power of setting alerts early.',
     ARRAY['Symmetrical Triangle', 'Breakout', 'Options Multi-bagger'], '2024-12-23'),

    (v_user_id, 'KEI Industries — Perfect Momentum Catch (4.25X)', 'KEI', 'Technical',
     'KEI 4200CE entry at 76 with SL 45. Stock became top gainer. CE moved 76→303 = 4.25X = 425% gain. Example of riding momentum with trailing SL. First target 89→trail→120→150→303. Never moved SL backward.',
     ARRAY['Momentum', 'Trailing SL Discipline', 'Multi-bagger'], '2024-12-22'),

    (v_user_id, 'ASHOKLEY — Pole and Flag Breakout at High', 'ASHOKLEY', 'Technical',
     'ASHOKLEY Pole and Flag breakout at high. 165CE 2.5→8.42 all targets done. Spot 163→188. Pattern works like fire at new highs. Held for 11 days with discipline — trail SL at each target.',
     ARRAY['Pole and Flag', 'Breakout at High', 'Options'], '2025-01-02'),

    (v_user_id, 'BANKINDIA — Cup and Handle Pattern', 'BANKINDIA', 'Technical',
     'BANKINDIA cup and handle pattern crossing 154.70. 155CE bought at 4, hit 10.25 = 156% gain. Classic textbook pattern. Setup rating 9 — highest conviction trade. Volume confirmed breakout.',
     ARRAY['Cup and Handle', 'High Conviction', 'Volume Confirmation'], '2025-01-16'),

    (v_user_id, 'Risk Management — Index Trading Rules', 'NIFTY', 'Other',
     'Key learnings from Nov-Jan index trading: 1) Always trade Index with only 2-3 lots. 2) Do not use big quantity. 3) Index moves are sharp and violent. 4) Protect capital first. 5) Discipline makes money, greed breaks accounts. 6) NIFTY failed twice (Nov 24, Jan 8) — both SL hit. Win rate lower on index vs stocks.',
     ARRAY['Risk Management', 'Index', 'Capital Protection'], '2025-01-09'),

    (v_user_id, 'VOLTAS — Double Bottom and Breakout Analysis', 'VOLTAS', 'Technical',
     'VOLTAS 1400CE traded multiple times: Dec 16: 30-40→46. Jan 5: 1300CE→103, spot crossing 1449. Jan 7: 1400CE 30→127 all targets done! Jan 23: FEB 1400CE 30→45. Double bottom pattern on 15-min chart. Similar to COALINDIA pattern.',
     ARRAY['Double Bottom', 'Repeat Winner', 'Multi-timeframe'], '2025-01-28'),

    (v_user_id, 'Scalping Discipline Framework', 'NIFTY', 'Other',
     'Scalping Rules: 1) Always enter with Limit order. 2) Pre-define stop-loss. 3) Keep trailing SL ON. 4) Dont trade without SL. 5) Keep a Book Profit (TP) order. 6) Book half at target, trail remaining. 7) 1-point trailing is safe. Scalping is not about holding. Risk first. Profit follows.',
     ARRAY['Scalping', 'Discipline', 'Rules'], '2025-01-22');

  RAISE NOTICE '✅ 8 studies inserted!';

  RAISE NOTICE '══════════════════════════════════════';
  RAISE NOTICE '🎉 COMPLETE! 57 trades + 8 alerts + 8 studies imported for chartistmr@gmail.com';
  RAISE NOTICE '══════════════════════════════════════';

END $$;
