const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const envContent = fs.readFileSync('.env.local', 'utf-8')
const env = {}
envContent.split('\n').forEach(line => {
  const [key, ...rest] = line.split('=')
  if (key && rest.length > 0) env[key.trim()] = rest.join('=').trim()
})

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupStorage() {
  console.log('Creating uploads bucket...')
  
  // Try to get the bucket first
  const { data, error } = await supabase.storage.getBucket('uploads')
  
  if (error && (error.message.includes('not found') || error.message.includes('NoSuchBucket') || error.code === 'NoSuchBucket' || error.message.includes('The resource was not found'))) {
    // Create if not exists
    const { data: newBucket, error: createError } = await supabase.storage.createBucket('uploads', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
      fileSizeLimit: 10485760 // 10MB
    })
    
    if (createError) {
      console.error('Failed to create bucket:', createError)
      process.exit(1)
    }
    console.log('Bucket created successfully:', newBucket)
  } else if (error) {
    console.error('Error fetching bucket:', error)
    process.exit(1)
  } else {
    console.log('Bucket already exists.')
  }
}

setupStorage()
